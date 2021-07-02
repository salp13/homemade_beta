# Generated by Django 3.1.6 on 2021-06-30 19:46

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0004_auto_20210629_1813'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='image',
            field=models.ImageField(null=True, upload_to='recipes', validators=[django.core.validators.FileExtensionValidator([''])]),
        ),
    ]