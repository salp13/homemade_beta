# Generated by Django 3.1.6 on 2021-06-24 17:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_auto_20210620_1815'),
        ('recipes', '0002_auto_20210309_2100'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='owner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.RESTRICT, to='users.user'),
        ),
    ]