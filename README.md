# Gmail Unsubscriber & Cleaner

This Google Apps Script helps you automatically unsubscribe from promotional emails and clean up your Gmail inbox by deleting past emails from those senders.

## Features

*   Automatically finds unsubscribe links in promotional emails.
*   Supports both HTTP and `mailto:` unsubscribe links.
*   Keeps a permanent list of unsubscribed senders to avoid reprocessing them.
*   Deletes all existing promotional emails from a sender after a successful unsubscribe action.
*   Processes emails in batches to stay within Google's script execution time limits.

## How it Works

1.  The script searches for emails in your "Promotions" category that contain the word "unsubscribe".
2.  For each new sender, it extracts the unsubscribe link from the email's headers (`List-Unsubscribe`) or from a link in the email body containing the word "unsubscribe".
3.  It then either visits the unsubscribe URL or sends an email to the unsubscribe address.
4.  Once the unsubscribe action is taken, it adds the sender's email to a permanent list stored in `PropertiesService` to ensure it doesn't process the same sender again.
5.  Finally, it finds all emails from that sender with the "Promotions" label and moves them to the trash.

## Setup and Usage

### 1. Create the Script

1.  Go to [script.google.com](https://script.google.com/).
2.  Click **New project**.
3.  Delete any content in the `Code.gs` file and paste the script code.
4.  Click the **Save project** icon.

### 2. Run the Script Manually

1.  From the function dropdown list at the top, select `unsubscribeAndClean`.
2.  Click **Run**.
3.  The first time you run the script, Google will prompt you to authorize it. You must grant it permission to access your Gmail account to allow it to read your emails and send unsubscribe requests on your behalf.

### 3. Automate with Triggers (Optional)

You can set up a trigger to run the script automatically on a schedule (e.g., once a day).

1.  In the script editor, click on the **Triggers** icon (it looks like a clock) in the left sidebar.
2.  Click **Add Trigger**.
3.  Configure the trigger with the following settings:
    *   **Function to run**: `unsubscribeAndClean`
    *   **Deployment**: `Head`
    *   **Event source**: `Time-driven`
    *   **Type of time-based trigger**: `Day timer` (or your preferred frequency)
    *   **Time of day**: Select a time that works for you.
4.  Click **Save**.

## Disclaimer

*   This script moves emails to the trash. Emails in the trash are permanently deleted by Google after 30 days.
*   The script's effectiveness depends on the presence of standard unsubscribe links in the emails. If an email does not have a recognizable unsubscribe link, it will be skipped.
*   **Use this script at your own risk.** Always review the code to ensure you are comfortable with the actions it will perform on your account.
