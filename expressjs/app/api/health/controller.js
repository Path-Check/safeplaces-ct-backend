
/**
 * @method health
 * 
 * Health Check
 * 
 */
exports.health = async (req, res) => {
  const { body } = req

  // FromName, From, TextBody

  const token = body['ToFull'][0]['MailboxHash']
  if (token && token !== '') {
    const victims = await victimService.readMany({ token: token }, { populate: ['bondsman','user']})
    if (victims && victims.length > 0) {
      const victim = victims.shift()
      if (victim.user.email === body['From'].toLowerCase()) { // User is emailing bondsman
        await notificationService.addBondsmanMessage(victim.id, body['StrippedTextReply'], 'NOTIFICATION', true)
      } else { // Bondsman is emailing user
        await notificationService.addUserMessage(victim.id, body['StrippedTextReply'], 'NOTIFICATION', true)
      }
    } else {
      logger.error(`Victim not found on token (${token})`)
    }
  } else {
    logger.error('Token not found on email reply.')
  }

  return await res.status(200).json({})
}