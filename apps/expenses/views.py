from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.utils.dateparse import parse_date

from apps.accounts.views import admin_required
from .models import Expense
from .forms import ExpenseForm


@admin_required
def expenses_view(request):
    show_modal = False
    editing_expense = None

    if request.method == "POST":
        expense_id = request.POST.get("expense_id")
        action = request.POST.get("action", "save")

        if action == "delete" and expense_id:
            expense = get_object_or_404(Expense, pk=expense_id)
            expense.delete()
            return redirect("expenses:expenses")

        if expense_id:
            editing_expense = get_object_or_404(
                Expense,
                pk=expense_id
            )

        form = ExpenseForm(
            request.POST,
            instance=editing_expense
        )

        if form.is_valid():
            form.save()
            return redirect("expenses:expenses")

        show_modal = True

    else:
        form = ExpenseForm()

    expenses = Expense.objects.all()

    # DATE FILTERS
    date_from = request.GET.get("from", "")
    date_to = request.GET.get("to", "")

    if date_from:
        parsed_from = parse_date(date_from)
        if parsed_from:
            expenses = expenses.filter(
                expense_date__gte=parsed_from
            )

    if date_to:
        parsed_to = parse_date(date_to)
        if parsed_to:
            expenses = expenses.filter(
                expense_date__lte=parsed_to
            )

    # CATEGORY FILTER
    selected_category = request.GET.get("category", "All")

    if selected_category != "All":
        expenses = expenses.filter(
            category=selected_category
        )

    # TOTAL EXPENSES
    total_expenses = expenses.aggregate(
        total=Sum("amount")
    )["total"] or 0

    context = {
        "expenses": expenses,
        "total_expenses": total_expenses,
        "date_from": date_from,
        "date_to": date_to,
        "selected_category": selected_category,
        "categories": Expense.Category.choices,
        "form": form,
        "show_modal": show_modal,
        "editing_expense": editing_expense,
    }

    return render(request, "expenses.html", context)