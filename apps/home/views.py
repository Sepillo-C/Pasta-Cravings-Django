from django.shortcuts import render

def home(request):
    return render(request, "home.html")

def menu(request):
    return render(request, "menu.html")

def contact_view(request):
    return render(request, "contact.html")