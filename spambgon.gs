/**
 * Main function to unsubscribe from promotional emails and clean up the inbox.
 */
function unsubscribeAndClean() {
  var properties = PropertiesService.getUserProperties();
  var unsubscribedSenders = (properties.getProperty('unsubscribedSenders') || '').split(',').filter(Boolean);
  var unsubscribedSet = new Set(unsubscribedSenders);

  var threads = GmailApp.search('label:promotions unsubscribe', 0, 50); // Process in batches
  var processedCount = 0;

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var message = thread.getMessages()[0]; // Check the first message in the thread
    var senderEmail = extractSenderEmail(message.getFrom());

    if (!senderEmail || unsubscribedSet.has(senderEmail)) {
      continue; // Skip if we can't find the sender or have already unsubscribed
    }

    var rawContent = message.getRawContent();
    var unsubscribeUrl = extractUnsubscribeUrl(rawContent);

    if (unsubscribeUrl) {
      var unsubscribed = false;
      try {
        if (unsubscribeUrl.startsWith('mailto:')) {
          var mailtoParts = unsubscribeUrl.substring(7).split('?');
          var mailtoAddress = mailtoParts[0];
          GmailApp.sendEmail(mailtoAddress, 'Unsubscribe', 'Please unsubscribe me.');
        } else {
          UrlFetchApp.fetch(unsubscribeUrl, { muteHttpExceptions: true });
        }
        unsubscribed = true;
      } catch (e) {
        Logger.log('Failed to action unsubscribe link for ' + senderEmail + ': ' + e.toString());
      }

      if (unsubscribed) {
        Logger.log('Successfully unsubscribed from ' + senderEmail);
        processedCount++;

        // Add sender to the permanent list
        unsubscribedSet.add(senderEmail);

        // Delete all promotional emails from this sender
        var senderThreads = GmailApp.search('from:"' + senderEmail + '" label:promotions');
        var deletedCount = 0;
        for (var j = 0; j < senderThreads.length; j++) {
          senderThreads[j].moveToTrash();
          deletedCount++;
        }
        Logger.log('Deleted ' + deletedCount + ' promotional threads from ' + senderEmail);
      }
    }
  }

  // Save the updated list of unsubscribed senders
  properties.setProperty('unsubscribedSenders', Array.from(unsubscribedSet).join(','));
  Logger.log('Finished run. Processed ' + processedCount + ' new senders.');
}

/**
 * Extracts the unsubscribe URL from the raw content of an email.
 */
function extractUnsubscribeUrl(rawContent) {
  var listUnsubscribeHeader = rawContent.match(/List-Unsubscribe:.*<(.*)>/);
  if (listUnsubscribeHeader && listUnsubscribeHeader[1]) {
    return listUnsubscribeHeader[1].trim();
  }
  var unsubscribeLink = rawContent.match(/<a\s+[^>]*href=["'](https?:\/\/[^"']*)["'][^>]*>\s*unsubscribe\s*<\/a>/i);
  if (unsubscribeLink && unsubscribeLink[1]) {
    return unsubscribeLink[1];
  }
  return null;
}

/**
 * Extracts a clean email address from a "From" header string.
 * e.g., "Sender Name <sender@example.com>" -> "sender@example.com"
 */
function extractSenderEmail(fromHeader) {
  var match = fromHeader.match(/<([^>]+)>/);
  if (match) {
    return match[1];
  }
  return fromHeader; // Return the raw string if no email in brackets is found
}
