import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom"
import Axios from "axios"
import { CSSTransition } from "react-transition-group"

Axios.defaults.baseURL = process.env.BACKENDURL || "https://backendformyapp2.herokuapp.com"

//app components
import Header from "./components/Header.js"
import Footer from "./components/Footer.js"
import HomeGuest from "./components/HomeGuest.js"
import About from "./components/About.js"
import Terms from "./components/Terms.js"
import Home from "./components/Home.js"
//import CreatePost from "./components/CreatePost.js"
const CreatePost = React.lazy(() => import("./components/CreatePost")) //Suspense
//import ViewSinglePost from "./components/ViewSinglePost.js"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost")) //Suspense
import FlashMessages from "./components/FlashMessages"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
//import Search from "./components/Search.js"
const Search = React.lazy(() => import("./components/Search")) //Suspense
//import Chat from "./components/Chat"
const Chat = React.lazy(() => import("./components/Chat")) //Suspense
import LoadingDotsIcon from "./components/LoadingDotsIcon.js"

function Main(props) {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexappToken"),
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }
  function ourReducer(draft, action) {
    //state, action
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      //return { loggedIn: true, flashMessages: state.flashMessages }
      case "logout":
        draft.loggedIn = false
        //props.history.push("/")
        return
      //return { loggedIn: false, flashMessages: state.flashMessages }
      case "flashMessages":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      //return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) }
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)
  /*const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexappToken")))
  const [flashMessages, setFlashMessages] = useState([])

  function addFlashMessage(msg) {
    setFlashMessages(prev => prev.concat(msg))
  }*/
  //check if token is expired or not
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { CancelToken: ourRequest.token })
          console.log(response.data)
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessages", value: "Your session has expired. Please log in again." })
          }
        } catch (e) {
          console.log("olmuyor zanim")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token)
      localStorage.setItem("complexappUsername", state.user.username)
      localStorage.setItem("complexappAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("complexappToken")
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
    }
  }, [state.loggedIn])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
