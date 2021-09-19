
import { Route } from "react-router"
import NotFound from "../NotFound" 

    
const AdminRoute = ({component: Component, user, isUserAdmin, ...rest}) => {

    
    return (
        <Route
        {...rest}
        render={(props) => isUserAdmin
            ? <Component user={user} {...props} />
            : <NotFound />}
        />
    )
      
}

export default AdminRoute;