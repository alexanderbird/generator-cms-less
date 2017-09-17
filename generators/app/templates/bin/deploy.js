const awsCli = require('aws-cli-js');
const config = require('../package').deploy;
const bucketPolicy = require('../s3_bucket_policy');

const aws = new awsCli.Aws(awsCli.Options);

console.log(`Deploying to Amazon Web Services S3 Bucket ${config.bucket}`);

// Unfortunately, aws-cli-js writes to `console.error` when there is an error. Suppress it.
let error = console.error;
console.error = () => {};
aws.command(`s3api get-bucket-location --bucket "${config.bucket}"`).then().catch(() => {
  // The bucket doesn't exist; create it
  return aws.command(`s3 mb "s3://${config.bucket}" --region ${config.region}`)
}).then(() => {
  // Configure bucket as a website
  return aws.command(`s3 website "s3://${config.bucket}" --index-document index --error-document 404 --region ${config.region}`);
}).then(() => {
  // Set bucket policy
  let policy = JSON.stringify(bucketPolicy).replace(/%%bucket%%/g, config.bucket); 
  policy = policy.replace(/"/g, "\\\"");
  return aws.command(`s3api put-bucket-policy --bucket "${config.bucket}" --policy "${policy}" --region ${config.region}`);
}).then(() => {
  // Set all files without an extension to text/html file type
  return aws.command(`s3 sync ./build/ "s3://${config.bucket}" --region ${config.region} --content-type text/html --exclude "*.*"`);
}).then(() => {
  // Sync the rest, deleting any unused files
  return aws.command(`s3 sync ./build/ "s3://${config.bucket}" --region ${config.region} --delete`);
}).catch(error);
