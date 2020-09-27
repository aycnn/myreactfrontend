import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollow(props) {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      if (props.action == "followers") {
        try {
          const response = await Axios.get(`/profile/${username}/followers`, { cancelToken: ourRequest.token })
          setPosts(response.data)
          setIsLoading(false)
        } catch {
          console.log("hata olustu ya da istek iptal edildi")
        }
      } else if (props.action == "following") {
        try {
          const response = await Axios.get(`/profile/${username}/following`, { cancelToken: ourRequest.token })
          setPosts(response.data)
          setIsLoading(false)
        } catch {
          console.log("hata olustu ya da istek iptal edildi")
        }
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [props.action])

  if (isLoading) {
    return <LoadingDotsIcon />
  }
  return (
    <div className="list-group">
      {posts.length > 0
        ? posts.map((follow, index) => {
            return (
              <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src={follow.avatar} /> {follow.username}
              </Link>
            )
          })
        : ""}
      {isLoading == false && posts.length == 0 && props.action == "followers" ? <p>There is no followers</p> : ""}
      {isLoading == false && posts.length == 0 && props.action == "following" ? <p>There is no following</p> : ""}
    </div>
  )
}

export default ProfileFollow
