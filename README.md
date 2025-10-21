# Gmail Unsubscriber & Cleaner

This Google Apps Script helps you automatically unsubscribe from promotional emails and clean up your Gmail inbox by deleting past emails from those senders.

## Features

*   **Automatic Unsubscribing:** Finds and actions unsubscribe links in promotional emails.
*   **Robust Link Finding:**
    *   Prioritizes the `List-Unsubscribe` header for the most reliable unsubscribe method.
    *   If no header is found, it intelligently searches the email body for links containing keywords like "unsubscribe," "preferences," or "opt-out."
    *   Handles many tricky and unusual link formats.
*   **Efficient Body Search:** To speed up the process, the script focuses its search on the last 2000 characters of an email, which is where unsubscribe links are typically located.
*   **Automatic Cleanup:**
    *   When a new sender is unsubscribed, the script deletes all their existing promotional emails.
    *   Periodically cleans your inbox by deleting promotional emails from senders you've already unsubscribed from in the past.
*   **Permanent Unsubscribe List:** Keeps a list of unsubscribed senders to avoid reprocessing them and to enable the periodic cleanup.
*   **Safe and Efficient:** Processes emails in batches to stay within Google's script execution time limits and includes robust error handling.
*   **Debugging Mode:** Includes a `DEBUG` flag to enable detailed logging for troubleshooting.

## How it Works

1.  **Periodic Cleanup:** The script first goes through your list of already unsubscribed senders and deletes any of their promotional emails that are still in your inbox.
2.  **Find New Emails:** It then searches for emails in your "Promotions" category that contain the word "unsubscribe."
3.  **Extract Unsubscribe Link:** For each new sender, it attempts to find the unsubscribe link using the following methods, in order of preference:
    1.  **`List-Unsubscribe` Header:** It first looks for a `List-Unsubscribe` header, which is the most reliable method.
    2.  **Email Body:** If no header is found, it searches the last 2000 characters of the email's body for any links that contain keywords like "unsubscribe," "preferences," or "opt-out."
4.  **Action Unsubscribe Link:** It then either visits the unsubscribe URL or sends an email to the unsubscribe address.
5.  **Update & Clean:** Once the unsubscribe action is taken, it adds the sender's email to a permanent list and then finds all emails from that sender with the "Promotions" label and moves them to the trash.

## Setup and Usage

### 1. Create the Script

1.  Go to [script.google.com](https://script.google.com/).
2.  Click **New project**.
3.  Delete any content in the `Code.gs` file and paste the script code from `unsubscribe.gs`.
4.  Click the **Save project** icon.

### 2. Run the Script Manually

1.  From the function dropdown list at the top, select `unsubscribeAndClean`.
2.  Click **Run**.
3.  The first time you run the script, Google will prompt you to authorize it. You must grant it permission to access your Gmail account.

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

## Debugging

The script includes a `DEBUG` flag at the top of the `unsubscribeAndClean` function. When set to `true`, the script will log detailed information about emails it fails to process. This is useful for troubleshooting but can be set to `false` during normal operation to keep the logs clean.

## Disclaimer

*   This script moves emails to the trash. Emails in the trash are permanently deleted by Google after 30 days.
*   The script's effectiveness depends on the presence of standard unsubscribe links in the emails.
*   **Use this script at your own risk.** Always review the code to ensure you are comfortable with the actions it will perform on your account.
