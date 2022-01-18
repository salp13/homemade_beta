from storages.backends.azure_storage import AzureStorage
import os

class AzureMediaStorage(AzureStorage):
    account_name = 'homemadeblob' 
    account_key = os.environ.get('BLOB_KEY', '') 
    azure_container = 'media'
    expiration_secs = None

class AzureStaticStorage(AzureStorage):
    account_name = 'homemadeblob' 
    account_key = os.environ.get('BLOB_KEY', '')  
    azure_container = 'static'
    expiration_secs = None