# Generated by Django 3.1 on 2020-08-21 18:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0002_auto_20200821_1715'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recipe',
            name='diets',
        ),
        migrations.AddField(
            model_name='recipe',
            name='diets_id',
            field=models.ForeignKey(default='1', on_delete=django.db.models.deletion.RESTRICT, to='recipes.diet'),
            preserve_default=False,
        ),
    ]
