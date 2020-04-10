const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose')

const app = express();

const jwt = require('jsonwebtoken');

//Load in the models
const {List,Task,User} = require('./db/models')

/* MIDDLEWARE */

//Load middleware
app.use(bodyParser.json())

//Cors HEADERS MIDDLEWARE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    
    next();
  });

  //check whether the request has a valid jwt access token
  let authenticate = (req, res, next)=>{
    let token = req.header('x-access-token');

    //verify the jwt
    if(token){
    jwt.verify(token, User.getJWTSecret(), (err, decoded)=>{
        if(err){
            //there was an error
            //jwt is invalid - do not authenticate
            res.sendStatus(401).send(err);
        }else{
            //jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
    }else{
        res.sendStatus(401);
    }

  }

  //verify refresh token
  let verifySession = (req, res, next)=>{
      //grab the refresh token from the request header
      let refreshToken = req.header('x-refresh-token');

      //grab the _id from the request header
      let _id = req.header('_id');

      User.findByIdAndToken(_id, refreshToken).then((user)=>{
          if(!user){
              //user couldn't be found
              
              return Promise.reject({
                  'error': 'User not found. Make sure that the refresh token and user id are correct'
              });
          }

          //if the code reaches here - user was found
          //therefore the refresh token exists in the database-
          //but still have to check if it has expired or not
          req.user_id = user._id;
          req.userObject = user;
          req.refreshToken = refreshToken;

          let isSessionvalid = false;

          user.sessions.forEach((session)=>{
              if(session.token === refreshToken){
                  //check if the session has expired
                  if(User.hasRefreshTokenExpired(session.expiresAt) === false){
                      //refresh token not expired
                      isSessionvalid = true;
                  }
              }
          });

          if(isSessionvalid){
              //session is valid - call next() to continue with processing the web request
              next();
          }else{
              //the session is not valid
              return Promise.reject({
                  'error':'Refresh token has expired or the session is invalid'
              });
          }
      }).catch((e)=>{
          res.sendStatus(401).send(e);
      });
  }

/*ROUTE HANDLERS*/

/*LIST ROUTES*/

/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists',authenticate, (req,res)=>{
    //We want to return an array of all the lists that belong the the authenticated user
    List.find({
        _userId: req.user_id
    }).then((lists)=>{
        res.send(lists);
    }).catch((e)=>{
        res.send(e);
    });
})


/**
 * POST /lists
 * Puropose: Create a list
 */
app.post('/lists',authenticate,(req,res)=>{
    //we want to create a new list and return the new list document back to the user (which includes the id)
    //The list info (fields) will be passed in via json request body
    let title = req.body.title;
    let newlist = new List({
        title,
        _userId: req.user_id
    });
    newlist.save().then((listDoc)=>{
        //the full list document is returned
        res.send(listDoc);
        
    });
});


/**
 * PATCH /lists/:id
 * Puropose: update a specified list
 */
app.patch('/lists/:id',authenticate,(req,res)=>{
    //We want to update the specified list (document with id in the url) with the new values specified in the json  body of the request
    List.findOneAndUpdate({_id:req.params.id,_userId: req.user_id},{
        $set: req.body
    }).then(()=>{
        res.send({"message":"List updated Successfully"});
    })
});


/**
 * DELETE /lists/:id
 * Puropose: Delete a specified list
 */
app.delete('/lists/:id',authenticate,(req, res)=>{
    //We want to delete the specified list (document with id in the url)
    List.findOneAndRemove(
        {
            _id: req.params.id,
            _userId: req.user_id
        }).then((removedListDoc)=>{
        res.send(removedListDoc);
   
        //delete all the tasks present in a deleted list
        deleteTasksFromList(removedListDoc._id)
    });
});


/**
 * GET /lists/:listId/tasks
 * purpose: get all of tasks of a specific list
 */
app.get('/lists/:listid/tasks',authenticate,(req, res)=>{
    //we want to return al tasks that belong to a particular list
    Task.find({_listid:req.params.listid}).then((tasks)=>{
        res.send(tasks);
    });
});

app.get('/lists/:listid/tasks/:taskid',authenticate,(req, res)=>{
    Task.findOne({
        _id: req.params.taskid,
        _listid: req.params.listid
    }).then((task)=>{
        res.send(task);
    });
});

app.post('/lists/:listId/tasks',authenticate,(req, res)=>{
    //We want to create a new task in the specified list

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            return true;
        }
        else{
        return false;
        }
    }).then((canCreateTask)=>{
        if(canCreateTask === true){

            let newTask = new Task({
                title: req.body.title,
                _listid:req.params.listId
            });
            newTask.save().then((taskDoc)=>{
                res.send(taskDoc);
            });

        }else{
            res.sendStatus(404);//not found
        }
    })

    
});

app.patch('/lists/:listid/tasks/:taskid',authenticate,(req,res)=>{
    //we want to update an existing task specified by the task id in the url
    List.findOne({
        _id: req.params.listid,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            return true;
        }
        else{
         return false;
        }
    }).then((canUpdateTask)=>{

        if(canUpdateTask === true){
            Task.findOneAndUpdate({
                _id: req.params.taskid,
                _listid: req.params.listid,
                _userId: req.user_id
            },  {
                 $set: req.body
                }
            ).then(()=>{
                res.send({message:"Updated Task"});
            });
        }else{
            res.sendStatus(404);
         }

    })
    
});

app.delete('/lists/:listid/tasks/:taskid',authenticate,(req, res)=>{

    List.findOne({
        _id: req.params.listid,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            return true;
        }
        else{
        return false;
        }
    }).then((canDeleteTask)=>{

        if(canDeleteTask){

            Task.findByIdAndRemove({
                _id: req.params.taskid,
                _listid: req.params.listid
            }).then((removedTaskDoc)=>{
                res.send(removedTaskDoc);
            });
        }
        else{
            res.sendStatus(404);
        }
    })
    
});


/*USER ROUTES*/

/**
 * POST /users
 * purpose: sign up
 */
app.post('/user', (req,res)=>{
    //User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(()=>{
         return newUser.createSession();
    }).then((refreshToken)=>{
        //session created successfully - refreshtoken returned
        //now we generate an access token for the user

        return newUser.generateAccessAuthToken().then((accessToken)=>{
            //access auth token generated successfully, now we return an object containing the author tokens
            return {accessToken, refreshToken}
        });
    }).then((authTokens)=>{
        //now we construct and send the response to the user with their auth tokens in the header and user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e)=>{
        res.status(400).send(e);
    })

})

app.post('/user/login',(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user)=>{
        return user.createSession().then((refreshToken)=>{
            //session created successfully - refresh token returned
            //now we generate access token for the user

            return user.generateAccessAuthToken().then((accessToken)=>{
                //access auth token generated successfully, now we return an object containing the auth tokens
                return {accessToken, refreshToken}
            });
        }).then((authTokens)=>{
            //now we construct and send the response to the user with their auth tokens in the header and user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
            })
    }).catch((e)=>{
            res.status(400).send(e);
        });
})


/**
 * GET /user/me/access-token
 * Purpose:generates and returns an access-token
 */
app.get('/user/me/access-token', verifySession, (req, res) =>{
    //we know that the user is authenticated and we have the user_id avaliable to us
    req.userObject.generateAccessAuthToken().then((accessToken)=>{
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch((e)=>{
        res.sendStatus(400).send(e);
    });
})

//Helper Methods
let deleteTasksFromList = (_listid)=>{
    Task.deleteMany({
        _listid
    }).then(()=>{
        console.log('Task from '+ _listid+' were deleted');
    })
}

app.listen(3001, ()=>{
    console.log('Server listening on port 3001');
});