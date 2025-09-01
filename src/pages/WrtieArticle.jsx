import React, { useState } from 'react'
import {Edit, Sparkles} from 'lucide-react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WrtieArticle = () => {
  
  const [input, setInput] = useState("")
  const articleLength =[
    {length:800, text: 'Short (500-800 words)'},
    {length:1200, text: 'Medium (800-1200 words)'},
    {length:1600, text: 'Long (1200-1600 words)'},
  ]
  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const {getToken} = useAuth();

  const onSubmitHandler = async (e)=>{
    e.preventDefault()
    try {
      setLoading(true)
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;
      const {data} = await axios.post('/api/ai/generate-article', {prompt, length:selectedLength.length}, {
        headers:{Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false);
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200' >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Article Topic</p>
        <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='Enter your article topic' required />

        <p className='mt-4 text-sm font-medium'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {articleLength.map((item, index)=> (
            <span onClick={()=> setSelectedLength(item)} key={index} className={`text-sm px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-blue-50 text-blue-700' : 'text-gray-500 border-gray-300'}`}>{item.text}</span>
          ) )}
        </div>
        <br />
        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> :  <Edit className='w-5'/>
          }
         
          Generate article
        </button>
      </form>
      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
          <div className='flex items-center gap-3'>
             <Edit className='w-5 h-5 text-[#4A7AFF]'/>
             <h1 className='text-xl font-semibold'>Generated Article</h1>
          </div>
          {!content ? (
<div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
          <Edit className='w-9 h-9 '/>
          <p>Enter a topic and click "Generate article" to get started.</p>
          </div>
          </div>
          ) : (
            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
              <div className="mt-4 h-full overflow-y-auto text-base text-slate-700 leading-relaxed space-y-4 p-4 rounded-2xl shadow-md bg-white/80 backdrop-blur-sm border border-slate-200">
  {content.split("\n").map((line, idx) => {
    // Headings
    if (line.startsWith("## ")) {
      return (
        <h2
          key={idx}
          className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mt-6"
        >
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1
          key={idx}
          className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mt-8 mb-2 tracking-wide"
        >
          {line.replace("# ", "")}
        </h1>
      );
    }
    // Bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      return (
        <li
          key={idx}
          className="ml-6 list-disc marker:text-indigo-500 hover:text-indigo-600 transition-all duration-200"
        >
          {line.replace(/^[-•]\s*/, "")}
        </li>
      );
    }
    // Empty line → fancy divider instead of plain <br>
    if (line.trim() === "") {
      return (
        <div
          key={idx}
          className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent"
        />
      );
    }
    // Default paragraph
    return (
      <p key={idx} className="leading-relaxed hover:pl-1 transition-all duration-200">
        {line}
      </p>
    );
  })}
</div>

            </div>
          )}
          
      </div>
    </div>
  )
}

export default WrtieArticle