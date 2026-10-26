# from django.shortcuts import render
# from .models import Customer

# def customer_view(request):
#     # Kunin ang lahat ng customer mula sa database
#     customers_list = Customer.objects.all()
    
#     # Ilagay sa context dictionary para mabasa ng template
#     context = {
#         'customers': customers_list
#     }
    
#     return render(request, 'customer_record/customer.html', context)


# from django.shortcuts import render, redirect
# from .models import Customer
# from .forms import CustomerForm     

# def customer_view(request):
#     customers_list = Customer.objects.all()
    
#     if request.method == 'POST':
#         form = CustomerForm(request.POST)
#         if form.is_valid():
#             form.save()
#             return redirect('customer')  # Babalik sa customer page pagkatapos i-save
#     else:
#         form = CustomerForm()

#     context = {
#         'customers': customers_list,
#         'form': form,
#     }
#     return render(request, 'customer_record/customer.html', context)

from django.shortcuts import render, redirect, get_object_or_404
from .models import Customer
from .forms import CustomerForm

def customer_view(request):
    customers_list = Customer.objects.all()
    
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('customer')
    else:
        form = CustomerForm()

    context = {
        'customers': customers_list,
        'form': form,
    }
    return render(request, 'customer_record/customer.html', context)


# IDAGDAG ANG FUNCTION NA ITO PARA MAWALA ANG ERROR:
def add_customer_view(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
    return redirect('customer')


def edit_customer_view(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            form.save()
    return redirect('customer')