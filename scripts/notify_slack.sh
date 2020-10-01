#!/bin/bash

echo -e 'Sending Notification to Slack...\n'
STATUS=$(node scripts/send_slack_notification.js) 

echo $STATUS

if [[ $STATUS = "SUCCESS" ]] 
then
    echo -e "Notification Sent:$STATUS\n"
else
    echo -e "Failed to send Notification: $STATUS\n"
fi
exit 0
