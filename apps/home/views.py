from django.shortcuts import render

def home(request):
    return render(request, "home/home.html")

def menu(request):
    return render(request, "menu/menu.html")