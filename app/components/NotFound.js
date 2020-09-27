import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import Page from "./Page"

function NotFound() {
  return (
    <Page title="Post not found">
      <div className="text-center">
        <h2>Whoops! we cannot find that page</h2>
        <p className="lead text-muted">
          If you want you can return{" "}
          <Link to="/">
            <bold>homepage</bold>
          </Link>
          .
        </p>
      </div>
    </Page>
  )
}

export default NotFound
