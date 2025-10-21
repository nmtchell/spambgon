/**
 * Main function to unsubscribe from promotional emails and clean up the inbox.
 */
function unsubscribeAndClean() {
  var DEBUG = true; // Set to true to enable detailed logging

  // Clean up emails from senders who are already on the unsubscribe list.
  deleteEmailsFromUnsubscribedSenders();

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

    var unsubscribeUrl = extractUnsubscribeUrl(message); // Pass the message object

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
    } else {
      if (DEBUG) {
        var body = message.getBody();
        Logger.log('Could not find unsubscribe URL for sender: ' + senderEmail);
        Logger.log('Body snippet (last 2000 chars): ' + body.substring(body.length - 2000));
      }
    }
  }

  // Save the updated list of unsubscribed senders
  properties.setProperty('unsubscribedSenders', Array.from(unsubscribedSet).join(','));
  Logger.log('Finished run. Processed ' + processedCount + ' new senders.');
}

/**
 * Deletes all promotional emails from senders in the unsubscribed list.
 */
function deleteEmailsFromUnsubscribedSenders() {
  var properties = PropertiesService.getUserProperties();
  var unsubscribedSenders = (properties.getProperty('unsubscribedSenders') || '').split(',').filter(Boolean);

  if (unsubscribedSenders.length === 0) {
    Logger.log('No senders in the unsubscribe list to clean up.');
    return;
  }

  Logger.log('Starting cleanup of promotional emails from ' + unsubscribedSenders.length + ' unsubscribed senders.');

  for (var i = 0; i < unsubscribedSenders.length; i++) {
    var senderEmail = unsubscribedSenders[i];
    var threads = GmailApp.search('from:"' + senderEmail + '" label:promotions');
    if (threads.length > 0) {
      Logger.log('Deleting ' + threads.length + ' promotional threads from ' + senderEmail);
      for (var j = 0; j < threads.length; j++) {
        threads[j].moveToTrash();
      }
    }
  }
  Logger.log('Finished cleaning up emails from unsubscribed senders.');
}

/**
 * Extracts the unsubscribe URL from an email message.
 */
function extractUnsubscribeUrl(message) {
  var listUnsubscribeHeader = message.getHeader('List-Unsubscribe');

  if (listUnsubscribeHeader) {
    // The header can contain multiple URLs, comma-separated.
    // e.g., <mailto:...>, <http:...>
    // We prefer the http link.
    var httpMatch = listUnsubscribeHeader.match(/<(https?:\/\/[^>]+)>/);
    if (httpMatch && httpMatch[1]) {
      return httpMatch[1];
    }
    
    var mailtoMatch = listUnsubscribeHeader.match(/<(mailto:[^>]+)>/);
    if (mailtoMatch && mailtoMatch[1]) {
      return mailtoMatch[1];
    }
    
    // If no <>, try to find a raw url
    var rawHttpMatch = listUnsubscribeHeader.match(/(https?:\/\/[^\s,]+)/);
    if (rawHttpMatch && rawHttpMatch[1]) {
        return rawHttpMatch[1];
    }
  }

  // If List-Unsubscribe fails, look for unsubscribe links in the body
  var body = message.getBody(); // Use getBody() for decoded HTML
  
  // Search in the last 2000 characters of the body, as unsubscribe links are usually in the footer
  var bodyEnd = body.substring(body.length - 2000);

  var unsubscribePatterns = [
    /<a\s+[^>]*href=["'](https?:\/\/?[^"']*)["'][^>]*>.*unsubscribe.*<\/a>/i,
    /<a\s+[^>]*href=["'](https?:\/\/?[^"']*)["'][^>]*>.*preferences.*<\/a>/i,
    /<a\s+[^>]*href=["'](https?:\/\/?[^"']*)["'][^>]*>.*opt-out.*<\/a>/i,
    /<a\s+[^>]*href=["'](https?:\/\/?[^"']*)["'][^>]*>.*opt out.*<\/a>/i
  ];

  for (var i = 0; i < unsubscribePatterns.length; i++) {
    var unsubscribeLink = bodyEnd.match(unsubscribePatterns[i]);
    if (unsubscribeLink && unsubscribeLink[1]) {
      return unsubscribeLink[1];
    }
  }
  
  return null;
}

/**
 * Extracts a clean email address from a "From" header string.
 * e.g., "Sender Name <sender@example.com>" -> "sender@example.com"
 */
function extractSenderEmail(fromHeader) {
  var email = fromHeader; // Default to the whole header

  var match = fromHeader.match(/<([^>]+)>/);
  if (match) {
    email = match[1];
  }

  // Basic email validation to avoid file paths or other invalid strings
  if (email.match(/\S+@\S+\.\S+/)) {
    return email;
  }

  return null; // Return null if no valid email is found
}
