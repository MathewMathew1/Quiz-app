
import { Route, Redirect } from "react-router"


const PrivateRoute = ({component: Component, user, ...rest}) => {
    return (
      <Route
        {...rest}
        render={(props) => localStorage.getItem("token")
          ? <Component user={user} {...props} />
          : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
      />
    )
  }

export default PrivateRoute