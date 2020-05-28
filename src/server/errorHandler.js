
const logErrors = () => {
  return (error, req, res) => {

    let errorCode = error.statusCode || 500
    let errorMessage = error.message || 'General error.'
  
    console.log(`${errorCode} - ${errorMessage}`)
    if (error.stack) {
      console.log('##### Error Stack: ', error.stack)
    }
  
    res.status(errorCode).json({ message: `${errorCode} - ${errorMessage}` })
  }
}

module.exports = logErrors