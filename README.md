# gcp_storage_helper
For GCP Storage Utility API

# Request Parameter
Content-Type : "application/json"

```Body 
{
    identify : Identify,
    buffer : BASE64_ENCODING_FILE (Optional if url given),
    url : URL of the file (Optional if URL given)
    bucket : Bucket-Name (Optional),
    metadata : Metadata (Optional)
}
```

Response
```
{
    code : "000",
    message : ""
}
```
Failure case
If no buffer / url passed : Bad request


# Setup
Require a .env file and credential.json which is download from Google Storage API
Grant Storage Admin role to the service account

* .env
* GOOGLE_APPLICATION_CREDENTIALS=credential.json
```
credential.json
{
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "-----BEGIN PRIVATE KEY-----\\nDn6T1LbNI8Z+Wwc7z52tY=\n-----END PRIVATE KEY-----\n",
    "client_email": "xxxxx@appspot.gserviceaccount.com",
    "client_id": "xxxx",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/%40appspot.gserviceaccount.com"
}
```
# Deployment
* Local Simulator  (With functions-framework)
    npm start
