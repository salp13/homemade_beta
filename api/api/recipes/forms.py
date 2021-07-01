from django import forms
from .models import Recipe
from django.core.validators import FileExtensionValidator
  
class RecipeForm(forms.ModelForm):
    # image = models.ImageField(upload_to='recipes', null=True, validators=[FileExtensionValidator([''])])
    ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'gif']

    class Meta:
        model = Recipe
        fields = ['image']

    def clean_avatar(self):
        image = self.cleaned_data.get('image', None)
        if not avatar:
            raise forms.ValidationError('Missing image file')
        try:
            extension = os.path.splitext(image.name)[1][1:].lower()
            if extension in self.ALLOWED_TYPES:
                return avatar
            else:
                raise forms.ValidationError('File types is not allowed')
        except Exception as e:
            raise forms.ValidationError('Can not identify file type')