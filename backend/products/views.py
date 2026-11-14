from django.shortcuts import get_object_or_404

# Create your views here.

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from .models import CakeImage, Category, Cake
from .serializers import CakeImageUploadSerializer, CategorySerializer, CakeSerializer


from accounts.permissions import IsSuperuser


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).order_by('name')

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]



class CakeListView(generics.ListAPIView):
    queryset = Cake.objects.filter(is_available=True).select_related('category').prefetch_related('images').order_by('created_at')

    serializer_class = CakeSerializer
    permission_classes = [AllowAny]


class AdminCakeListCreateView(generics.ListCreateAPIView):
    queryset = Cake.objects.select_related('category').prefetch_related('images').order_by('name')
    serializer_class = CakeSerializer
    permission_classes = [IsSuperuser]


class CakeDetailView(generics.RetrieveAPIView):
    queryset = Cake.objects.filter(is_available=True).select_related('category').prefetch_related('images')

    serializer_class = CakeSerializer
    permission_classes = [AllowAny]


#admin views

class AdminCategoryCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSuperuser]

class AdminCategoryUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSuperuser]

    def perform_destroy(self, instance):
        if instance.cakes.exists():
            raise ValidationError({'detail': 'Cannot delete a category while cakes use it.'})
        instance.delete()

class AdminCakeUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cake.objects.all()
    serializer_class = CakeSerializer
    permission_classes = [IsSuperuser]



class AdminCakeImageCreateView(generics.CreateAPIView):
    queryset = CakeImage.objects.all()
    serializer_class = CakeImageUploadSerializer
    permission_classes = [IsSuperuser]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        cake = get_object_or_404(
            Cake , 
            pk = self.kwargs.get('pk')  # Assuming you pass the cake's primary key in the URL
        )

        serializer.save(cake=cake)

class AdminCakeImageDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CakeImage.objects.all()
    serializer_class = CakeImageUploadSerializer
    permission_classes = [IsSuperuser]
    lookup_url_kwarg = 'image_pk'

    def get_queryset(self):
        return super().get_queryset().filter(cake_id=self.kwargs['pk'])

    def perform_destroy(self , instance):
        if instance.image:
            instance.image.delete(save=False)  # Delete the image from storage
        instance.delete()  # Delete the instance from the database


class AdminCakeImagePrimaryView(generics.UpdateAPIView):
    queryset = CakeImage.objects.all()
    serializer_class = CakeImageUploadSerializer
    permission_classes = [IsSuperuser]
    lookup_url_kwarg = 'image_pk'

    def get_queryset(self):
        return super().get_queryset().filter(cake_id=self.kwargs['pk'])

    def perform_update(self, serializer):
        cake_image = serializer.instance
        cake = cake_image.cake

        # Set all other images of the same cake to not primary
        CakeImage.objects.filter(cake=cake).update(is_primary=False)

        # Set the current image as primary
        serializer.save(is_primary=True)
