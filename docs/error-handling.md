# Error handling
Errors are likely to fall into one of the following general groups
- **Initialisation errors**: i.e. problems during start-up
- **General server errors**: errors which occur outside of user requests, possibly during automated tasks
- **User errors**: errors which are a direct result of a user request

## Initialisation errors 
Any errors which occur during initialisation should be captured and logged as appropriate. 

If the initialisation process for your module is synchronous, the core module is able automatically or may require 