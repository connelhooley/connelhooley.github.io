---
title:  KGH Illustrates
website: https://www.kghillustrates.co.uk
languages:
- JS
technologies:
- Gastby
- Tailwind CSS
- AWS Amplify
- AWS Lambda
- AWS API Gateway
- AWS SQS
- AWS SES
order: 1
github: false
---

A website for a wedding stationer and illustrator. The site also provides a couple of contact forms. 

The front-end is a static [Gatsby JS](https://www.gatsbyjs.com/) React site. Lots of images are used in the site due to the graphical nature of the business. [Gatsby JS's image plugin](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) provided an easy way to resize, crop and compress images. It also provides support for lazy-loading images on scroll. This ensured the site remained performant. Gatsby JS also handles "non-functional" features like site maps, favicons and Google Analytics.

The front-end is styled using [Tailwind CSS](https://tailwindcss.com/). This provided a really fast way to get the site built. Small React components provide the semantic meaning that is lost when using utility-first CSS frameworks. All of the styling, markup and functionality is in the same JSX file which makes development easier.

The site's front-end is hosted using [AWS Amplify static hosting](https://aws.amazon.com/amplify/hosting/), which is a wrapper around [AWS CloudFront](https://aws.amazon.com/cloudfront/) and [AWS S3](https://aws.amazon.com/s3/).

The contact forms are implemented using a number of AWS services. The browser accesses an [AWS API Gateway](https://aws.amazon.com/api-gateway/) via the [AWS Amplify JavaScript SDK](https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js/). The gateway invokes an [AWS Lambda function](https://aws.amazon.com/lambda/) that places a message on an [AWS SQS](https://aws.amazon.com/sqs/) instance. Another [AWS Lambda function](https://aws.amazon.com/lambda/) then polls the queue and uses [AWS SES](https://aws.amazon.com/ses/) to send an email.

The code is hosted in [AWS CodeCommit](https://aws.amazon.com/codecommit/). Continious deployment is implemtented using [AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-backend.html). The domain and DNS is managed via [AWS Route 53](https://aws.amazon.com/route53/).