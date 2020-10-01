#!/bin/bash

ACTION_STATUS="none"

while getopts "s:" arg; do
echo -e ${arg}
  case "${arg}" 
  in
    s) ACTION_STATUS=${OPTARG};;
    :)
    echo "Error: -${OPTARG} requires an argument." 1>&2
    exit 1
    ;;
  esac
done

if [[ $ACTION_STATUS != "none" ]]
    then
    echo -e 'Sending Notification to Slack...\n'
    SENT_STATUS=$(node scripts/send_slack_notification.js $ACTION_STATUS) 
    if [[ $SENT_STATUS == "SUCCESS" ]]
    then
        echo -e "${ACTION_STATUS} Notification Sent\n"
    else
        echo -e "Failed to send ${ACTION_STATUS} Notification\n"
    fi
else 
    echo "Failed to send Notification: Status argument missing"
fi