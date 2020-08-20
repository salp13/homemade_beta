# Generated by Django 3.1 on 2020-08-20 00:02

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('food', '0005_auto_20200819_2349'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cuisine',
            fields=[
                ('cuisine_id', models.CharField(max_length=128, primary_key=True, serialize=False)),
                ('cuisine', models.CharField(max_length=128)),
            ],
            options={
                'db_table': 'cuisine',
            },
        ),
        migrations.CreateModel(
            name='Diet',
            fields=[
                ('diet_id', models.CharField(max_length=128, primary_key=True, serialize=False)),
                ('diet', models.CharField(max_length=128)),
            ],
            options={
                'db_table': 'diet',
            },
        ),
        migrations.CreateModel(
            name='Meal_Type',
            fields=[
                ('meal_type_id', models.CharField(max_length=128, primary_key=True, serialize=False)),
                ('meal_type', models.CharField(max_length=128)),
            ],
            options={
                'db_table': 'meal_type',
            },
        ),
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('recipe_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=128)),
                ('image', models.CharField(max_length=128, null=True)),
                ('description', models.TextField()),
                ('cuisine', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='recipes.cuisine')),
                ('diets', models.ManyToManyField(to='recipes.Diet')),
                ('meal_type', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='recipes.meal_type')),
            ],
            options={
                'db_table': 'recipe',
            },
        ),
        migrations.CreateModel(
            name='Ingredient',
            fields=[
                ('ingredient_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveSmallIntegerField(default=1)),
                ('measurement_unit', models.CharField(max_length=128)),
                ('food', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='food.food')),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='recipes.recipe')),
            ],
            options={
                'db_table': 'ingredient',
            },
        ),
    ]