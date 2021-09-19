
import ReactModal from 'react-modal';



function DeleteModal({isModalOpen, deleteFunction, setIsModalOpen}) {
    return (
        <div>
            <ReactModal
                isOpen={isModalOpen}
                contentLabel={"Delete Question"}
                id={"delete"}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                shouldReturnFocusAfterClose={true}z
                
                appElement={document.getElementById('root') || undefined}
                style={{
                    overlay: {
                        
                        padding: "1rem"
                    },
                    content: {
                        marginRight: "auto",
                        marginLeft: "auto",
                        minWidth: "15rem",
                        width: "25%",
                        border: '1px solid #ccc',
                        background: '#fff',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '4px',
                        
                        padding: '0.8rem',
                        height: "fit-content"
                    }
                }}>
                Are you sure you want to delete this question?
                <div className="right" style={{marginTop: "0.5rem"}}>
                    <button className="button blue-button" onClick={ () => setIsModalOpen(false)} >Close</button>
                    <button className="button red-button" onClick={ () => deleteFunction()} >Delete</button>
                </div>
            </ReactModal>
        </div>
    );
}

export default DeleteModal;