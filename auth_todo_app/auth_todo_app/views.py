from django.shortcuts import render


def login_view(request):
    return render(request, "login.html")


def register_view(request):
    return render(request, "register.html")


def todo_view(request):
    return render(request, "todos.html")


def homepage(request):
    return render(request, "home.html")


def aboutpage(request):
    return render(request, "about.html")
