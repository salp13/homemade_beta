# Generated by Django 3.1 on 2020-09-07 16:06

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Food_Group',
            fields=[
                ('food_group_id', models.AutoField(primary_key=True, serialize=False)),
                ('food_group', models.CharField(max_length=128)),
                ('image', models.CharField(max_length=128, null=True)),
            ],
            options={
                'db_table': 'food_group',
            },
        ),
        migrations.CreateModel(
            name='Food',
            fields=[
                ('food_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('food_name', models.CharField(max_length=128, unique=True)),
                ('default_days_to_exp', models.PositiveSmallIntegerField(null=True)),
                ('food_group', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='food.food_group')),
            ],
            options={
                'db_table': 'food',
            },
        ),
    ]
