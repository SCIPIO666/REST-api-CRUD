
import './App.css'
import { useEffect,useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL;

function Content({header='',array=[],onDelete='',onEdit=''}){
  return(
    <div className='w-full bg-black text-white flex flex-wrap justify-center align-middle mx-auto rounded shadow-2xl'>
      <h3 className='text-blue-500 font-bold w-full'>{header}</h3>
      <div className='w-full flex flex-wrap justify-center align-middle mx-auto p-4  gap-2 m-4'>
        {array.length>0 ?
          array.map(item=>{
          return <p 
                  key={item.id} 
                  className="p-4 mx-auto m-4 w-4/5 flex gap-2 bg-gray-400 text-blue font-medium rounded justify-center align-middle
                            transition-all duration-300 ease-in-out 
                            hover:-translate-y-1 hover:shadow-2xl hover:bg-gray-300"
>
            <span className='p-2 mx-auto m-2 font-bold h-10 w-10 rounded-full shadow-2xl bg-white text-black w-1/5 '>{item.id}</span>
            <span className='p-2 mx-auto m-2 font-bold rounded shadow-2xl bg-white text-black w-1/3 '>{item.title}</span>
            <span className='p-2 mx-auto m-2 font-bold rounded shadow-2xl bg-white text-black w-1/3 '>{item.author}</span>
            <span  style={{color: item.read_status ? 'green': 'red'}} className='p-2 mx-auto m-2 font-bold rounded-full shadow-2xl text-black w-1/5 bg-black '>{item.read_status ? 'read': 'unread'}</span>
            <span onClick={()=>onDelete(item.id)}  className='p-2 mx-auto m-2 font-bold rounded-full bg-red-400 shadow-2xl text-black w-1/5 text-white '>delete</span>
            <button className='rounded p-2 m-2 bg-blue-300 font-bold ' onClick={()=>onEdit(item.id,item.title,item.author)}>edit</button>
           </p>
        }): ""}
      </div> 
    </div>

  )
}
function App() {

    const [books,setBooks]=useState([]);
    const [newBook,setNewBook]=useState('')
    const [error,setError]=useState(null);
    const [success,setSuccess]=useState(false);
    const [isLoading,setIsLoading]=useState(false);
    const [editTitle,setEditTitle]=useState('');
    const[editAuthor,setEditAuthor]=useState('');
    const [editId,setEditId]=useState('');
    const [author,setAuthor]=useState('');
    const [actions,setActions]=useState(
                {
              oneBook: {description: 'fetching a single book' ,intent: "GET_ONE_BOOK"},
              allBooks: {description: 'fetching all books' ,intent: "GET_ALL_BOOKS"},
              addBook: {description: 'adding book to db' ,intent: "ADD_BOOK"},
              deleteBook: {description: 'deleting book from db' ,intent: "DELETE_BOOK"},
              updateBook: {description: 'updating book in db' ,intent: "UPDATE_BOOK"},
              default: {description: 'server listening for requests' ,intent: "LISTEN"}
              }
      ) ;
    const [intent,setIntent]=useState(actions.allBooks.intent)
    const [contents,setContents]=useState({header: 'All Books',array: [...books]});
    const [currentAction,setCurrentAction]=useState(actions.default.description);
    
    async function fetchAllBooks(){
      setCurrentAction(actions.allBooks.description)
      try{
          const response=await fetch(`${API_BASE_URL}/api/books`);
        if (!response.ok) throw new Error('Failed to fetch books');    
        const data = await response.json();
        setBooks(data);
        setContents({ 
          header: 'All Books', 
          array: data
        });
        setSuccess(true);
        setError(null);  
      }catch(err){
        setError(`error fetching books from db ${err.error} `);
        setBooks([])
      }finally{
        setIsLoading(false)
        setCurrentAction(actions.default.description)
      }
    }
     async  function fetchOneBook(){
      setCurrentAction(actions.oneBook.description)
      try{
          const response=await fetch(`${API_BASE_URL}/api/books/single`);
        if (!response.ok) throw new Error('Failed to fetch books');    
        const data = await response.json();
        setBooks(data);
        setContents({header: 'Single Book',array: [...data]})
        setError(null);  
        setSuccess(true)
      }catch(err){
        setError(`error fetching book from db ${err.error} `);
        setBooks([])
        setSuccess(false)
      }finally{
        setIsLoading(false)
        setCurrentAction(actions.default.description)
      }
    }
    async function deleteBook1(id){
        setIsLoading(true);
        setCurrentAction(actions.deleteBook.description)
        try{
          const response=await fetch(`${API_BASE_URL}/api/books/${id}`,{
            method : 'DELETE',         
          })
          if (response.ok){
            fetchAllBooks()
            setSuccess(true)
            setError(null)
          }
        }catch(error){
          setSuccess(false)
          setError('book not deleted',error)
        }finally{
          setCurrentAction(actions.default.description)
          setIsLoading(false)
        }
    }
    function onEdit(id,newTitle,newAuthor){
        setEditId(id);
        setEditTitle(newTitle);
        setEditAuthor(newAuthor);
    }
    async function handleUpdate(e,id){
          e.preventDefault(); 
        setIsLoading(true);
        setCurrentAction(actions.updateBook.description)
         if (!editTitle || !editId || !editAuthor) return alert("Please fill in all edit fields");
        try{
      const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editTitle, author: editAuthor}) // Step 1: Serialize the changes
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Update successful!", data.updatedBook);
            setError(null)
            setSuccess(true)
            fetchAllBooks(); // Refresh UI
          }
        }catch(err){
            setError(`update failed ${err}`)
            setSuccess(false)
        }finally{
           setCurrentAction(actions.default.description)
          setIsLoading(false)     
        }
    }
    async function handleSubmit (e) {
    e.preventDefault(); 
    setIsLoading(true);
    setCurrentAction(actions.addBook.description)
    if (!newBook || !author) return alert("Please fill in all fields");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/add-book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ newBook, author }) // Step 1: Serialize
        });

        if (response.ok) {
            const data = await response.json();
            setSuccess(true)
            console.log("Success! New ID:", data);
            setNewBook(""); // Clear form
            setAuthor("");
           fetchAllBooks(); // Refresh list
        }
    } catch (err) {
        setError(`Failed to save book ${err.error}`);
        setSuccess(false)
    } finally {
        setIsLoading(false);
        setCurrentAction(actions.default.description)
    }
};
   
useEffect(() => {
  setIsLoading(true);
  switch (intent) {
    case actions.allBooks.intent:
      fetchAllBooks();
      break;
    case actions.oneBook.intent:
      fetchOneBook();
      break;

    default:
      fetchAllBooks();
  }
}, [intent]);


  return (
    <div className='flex flex-wrap justify-center align-middle bg-gray-400 rounded shadow-2xl w-8/10 p-4 m-4 mx-auto'>
      <h1 className='font-bold rounded shadow-xl mx-auto align-middle h-16 p-4 text-uppercase uppercase '>book store</h1>
        <div className='bg-white rounded shadow-2xl flex justify-center align-middle flex-wrap'>
            <h2 className='font-bold rounded w-full shadow-xl mx-auto align-middle h-16 p-4 m-4 text-uppercase uppercase'>back end actions</h2>
              <form onSubmit={(e=>handleSubmit(e))} className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'>
                    <label>title:<input type='text' 
                  onChange={(e)=>setNewBook(e.target.value)} 
                  value={newBook}
                  className='p-2 m-2 bg-white text-black'/></label>
                    <label>Author:<input type='text' 
                  onChange={(e)=>setAuthor(e.target.value)} 
                  value={author}
                  className='p-2 m-2 bg-white text-black'/></label>  
                    <button className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'
                  type='submit'
                >add book</button>        
              </form>

              <form onSubmit={(e=>handleUpdate(e,editId))} className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'>
                    <label>title:<input type='text' 
                  onChange={(e)=>setEditTitle(e.target.value)} 
                  value={editTitle}
                  className='p-2 m-2 bg-white text-black'/></label>
                    <label>Author:<input type='text' 
                  onChange={(e)=>setEditAuthor(e.target.value)} 
                  value={editAuthor}
                  className='p-2 m-2 bg-white text-black'/></label>  
                    <button className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'
                  type='submit'
                >update book</button>        
              </form>
            <button className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'
              onClick={()=>setIntent(actions.oneBook.intent)}
            >get book id=1</button>
            <button className='w- 1/3 p-2 m-2 rounded bg-blue-500 text-white font-bold space-x-1 hover:bg-cyan-800'
              onClick={()=>setIntent(actions.allBooks.intent)}
            >get all books</button>

        </div>
        <span className='font-bold bg-black rounded w-full shadow-xl  align-middle h-16 p-2 m-2 text-white'>{currentAction}...</span>

        <div className='w-9/10 p-4 m-2 bg-white rounded shadow-2xl flex justify-center align-middle mx-auto'>
            {isLoading && '...communicating with server'}
            {(!isLoading && !success && error) && error}
            {(!isLoading && success) && <Content header={contents.header} array={contents.array} onDelete={deleteBook1} onEdit={onEdit}/>}
        </div>

    </div>
  )
}

export default App
