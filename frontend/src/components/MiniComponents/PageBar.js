

const PageBar = ({link, amountOfPages}) => {

    return ( 
            <div className="PageBar">
                {Array.from(Array(amountOfPages), (_e, pageNumber) => {
                    return(
                        <a className="link" href={link+`&page=${pageNumber}`} key={pageNumber}>{pageNumber}</a>
                    )
                })}
            </div>
    );
}
 
export default PageBar;