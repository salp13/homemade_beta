# Generated by Django 3.1.6 on 2021-06-24 17:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0003_recipe_owner'),
        ('users', '0006_auto_20210620_1815'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='owned_recipes',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='users', to='recipes.recipe'),
        ),
    ]