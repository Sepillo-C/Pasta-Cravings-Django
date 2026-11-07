from django.shortcuts import render

def pos_view(request):
    return render(request, "pos.html")
