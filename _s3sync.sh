#s3cmd sync --recursive --acl-public dist/ s3://www.mtmckenna.com/
aws s3 sync --profile mtmckenna --region us-east-1  dist/ s3://www.mtmckenna.com/
