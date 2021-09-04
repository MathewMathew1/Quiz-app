

const PageBar = ({link, amountOfPages}) => {

    return ( 
            <footer className="PageBar">
                {Array.from(Array(amountOfPages), (_e, pageNumber) => {
                    return(
                        <a className="link" href={link+`&page=${pageNumber}`} key={pageNumber}>{pageNumber}</a>
                    )
                })}
            </footer>
    );
}
 
export default PageBar;