
import React, { useState, useEffect,useRef,useCallback } from 'react';
import {
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  MenuItem,
  Select,
  useMediaQuery,
  Dialog,
  DialogTitle, 
  DialogContent,

} from '@mui/material';
import { CheckCircle, Cancel, ExpandMore, PlayArrow } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorState ,EditorSelection} from '@codemirror/state';
import MonacoEditor from 'react-monaco-editor';
import debounce from 'lodash.debounce';
import './Page.css';
// import { getSyntaxSuggestions } from './geminiApi'; // Adjust the path as needed


const boilerplate = {
//   cpp: // Write your C++ code here
// #include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// },
//   python: # Python main function
// if _name_ == "_main_":
//     print("Hello, World!"),
//   javascript: // JavaScript main function
// function main() {
//     console.log("Hello, World!");
// }
// main();,
//   java: //  Java
// public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// },
};
const testCasesInitial = [
  { input: '3 5', expectedOutput: '8', output: '' },
  { input: '2 3', expectedOutput: '5', output: '' },
  { input: '7 4', expectedOutput: '11', output: '' },
];

const extraTestCases = [
  { input: '1 2', expectedOutput: '3', output: '' },
  { input: '4 5', expectedOutput: '9', output: '' },
  { input: '6 1', expectedOutput: '7', output: '' },
  { input: '2 8', expectedOutput: '10', output: '' },
  { input: '10 20', expectedOutput: '30', output: '' }
];

const Page = () => {
  const [code, setCode] = useState(boilerplate.cpp);
  const [testCases, setTestCases] = useState(testCasesInitial);
  const [activeTestCase, setActiveTestCase] = useState(0); // Index for current active test case
  const [testResults, setTestResults] = useState(Array(testCases.length).fill(null));
  const [extraTestCases, setExtraTestCases] = useState([{ input: '', expectedOutput: '', output: '' }]); // Pass/fail status of each test case
  const [loading, setLoading] = useState(false); // Loading state for initial test cases
  const [extraLoading, setExtraLoading] = useState(false); // Loading state for extra test cases
  const [language, setLanguage] = useState('cpp');
  const [error, setError] = useState(''); // Add this line to define an error state
  const [solved, setSolved] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [isFocusMode,setIsFocusMode] = useState(false);
  const [open, setOpen] = useState(false);

 const [inlineSuggestion, setInlineSuggestion] = useState('');
  const editorRef = useRef(null);
  const monacoRef = useRef(null);


  const handleRunCode = async (index, caseSet = 'main') => {
    setLoading(true);
    setError(''); // Clear previous errors

    const selectedTestCases = caseSet === 'extra' ? extraTestCases : testCases;

    // Set loading based on the case set
    if (caseSet === 'extra') {
      setExtraLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('https://api.codex.jaagrav.in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          input: selectedTestCases[index].input,
          language: 'cpp',
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error); 
        testCases[index].output = ''; 
    } else {  
        testCases[index].output = data.output.trim();
        setError(''); 
    }
    
      const updatedTestCases = [...selectedTestCases];
      updatedTestCases[index].output = data.output.trim();

      // Check if the output matches the expected output
      const updatedResults = [...testResults];
      if (updatedTestCases[index].output === selectedTestCases[index].expectedOutput) {
        updatedResults[index] = true; // Test passed
        setSolved(true);
      } else {
        updatedResults[index] = false; // Test failed
      }
      setTestResults(updatedResults);
      if (caseSet === 'extra') {
        setTestResults(updatedTestCases);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally { 
    if (caseSet === 'extra') {
      setExtraLoading(false);
    } else {
      setLoading(false);
    }}
    setLoading(false);
  };
  const handleGetSuggestions = async () => {
    // const currentCode = code; // Get current code from the state
    // const fetchedSuggestions = await getSyntaxSuggestions(currentCode);
    // setSuggestions(fetchedSuggestions); // Update the suggestions state
};

const handleCodeChange = (e) => {
    setCode(e.target.value); // Update the code as user types
    handleGetSuggestions(); // Get suggestions on every change or debounce as needed
};
  const handleSaveCode = () => {
    const file = new Blob([code], { type: 'text/plain' }); // Creates a text file with code content
    const fileName = `${code}.${language}`; // Names the file based on selected language
    const url = URL.createObjectURL(file); // Blob URL

    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName; // Sets the download filename
    document.body.appendChild(link);
    link.click(); // Triggers the download
    document.body.removeChild(link); // Removes link after download

    URL.revokeObjectURL(url); // Frees up the Blob URL
};
  // Run all extra test cases one by one
  const handleRunExtraTestCases = async () => {
    setExtraLoading(true);
    for (let i = 0; i < extraTestCases.length; i++) {
      await handleRunCode(i, 'extra');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    }
    setExtraLoading(false);
  };

  const f = async ()=>{
    
  }

  // Add new test case to main test cases
  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', output: '' }]);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    if (window.confirm('Changing the language will remove your current code. Do you want to proceed?')) {
      setLanguage(newLanguage);
      setCode(boilerplate[newLanguage]); // Set the boilerplate for the selected language
    }
  };

  // Save code to local storage
  useEffect(() => {
    const savedCode = localStorage.getItem('savedCode');
    const savedLanguage = localStorage.getItem('savedLanguage');
    if (savedCode) {
      setCode(savedCode);
      setLanguage(savedLanguage || 'cpp');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedCode', code);
    localStorage.setItem('savedLanguage', language);
  }, [code, language]);



  const handleClickOpen = () => {
    setOpen(true);
    document.getElementById('main-content').classList.add('blur-sm');
  };

  const handleClose = () => {
    setOpen(false);
    document.getElementById('main-content').classList.remove('blur-sm');
}





const generateCodeFromGemini = useCallback(
  debounce(async (currentCode) => {
    // f(currentCode);
    setCode(currentCode);
    console.log(currentCode);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCiATvRZXPHJrNnJnTzxc3cvOOAMPcBl_o', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `I am making a automatic inline code filler based on this code which i provide. You just have to complete the c++ line on the basis of this code only without any explanation and comments. Here is the code: ${currentCode}`,
         },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Log the response for debugging
        console.log('Gemini API response:', data.candidates[0]?.content?.parts?.[0]?.text);
        console.log(currentCode);
        // Safely access nested properties to prevent errors
        const generatedText =
           data.candidates[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
          appendInlineSuggestion(generatedText.trim(),currentCode); // Set the suggestion if available
        } else {
          console.warn('No valid suggestion returned from Gemini');
        }
      } else {
        console.error('Failed to generate code from Gemini:', response.statusText);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
  }, 500), // 500ms debounce
  []
);

const handleEditorMount = (editor,monaco) => {
  editorRef.current = editor;
  monacoRef.current = monaco;
};

const handleEditorChange = async (value, event) => {
  setCode(value);
  if ( event.changes[0].text == ';') {
    generateCodeFromGemini(value);
  }
};

const appendInlineSuggestion = (suggestion,t) => { 
  console.log(suggestion);
  console.log(t);
  if (editorRef.current && suggestion) {
    const editor = editorRef.current;
    const position = editor.getPosition(); // current cursor position 
    const newCode = suggestion; // Append the suggestion directly to code
    setCode(newCode);
    console.log(newCode?newCode:'');
    editor.setValue(newCode); // Update the editor with the new code

    // Optionally, move the cursor back to the original position
    editor.setPosition(position);
  }
};


const insertText = (symbol) => {
  const editor = editorRef.current;
  const monaco = monacoRef.current;
  if (editor && monaco) {
    const position = editor.getPosition();
    const range = new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    );

    editor.executeEdits('', [
      {
        range: range,
        text: symbol,
        forceMoveMarkers: true,
      },
    ]);

    // Move cursor to the end of the inserted symbol
    editor.setPosition({
      lineNumber: position.lineNumber,
      column: position.column + symbol.length,
    });

    editor.focus(); // Refocus the editor
  }
};




  return (
    
    <Box id="main-content" sx={{ p: isMobile ? '10px' : '20px', display: isFocusMode ? 'block' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
  {/* <Box sx={{ display: 'flex', gap: '20px', padding: '20px' }}> */}
  {/* Left Section: Question Title */}
  {!isFocusMode && (
      <Box sx={{ mb: '20px', p: '10px', border: '1px solid #ccc', flex: isMobile ? 'none' : 1 }}>
        <Typography variant="h6">Question Title: Example Question</Typography>
        {solved && <span style={{ marginLeft: '8px', fontSize: '0.8em', color: 'green !important' }}>✔️</span>}
        <Typography variant="subtitle1">Company: Example Company</Typography>
        <Typography variant="subtitle1">Examples:</Typography>
        <Typography>Input: 3 5</Typography>
        <Typography>Output: 8</Typography>


        {/* Left side: Extra Test Cases in Accordions */}
      <Box flex={1}>
        <Typography variant="h6">Extra Test Cases</Typography>
        {extraTestCases.map((testCase, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Test Case {index + 1}</Typography>
              <IconButton
                color={testResults[index] === null ? 'primary' : testResults[index] ? 'success' : 'error'}
                sx={{ ml: 'auto' }}
                onClick={() => handleRunCode(index, 'extra')}
                disabled={loading || extraLoading} // Disable button while code is running
              >
                {loading || extraLoading ? <CircularProgress size={24} color="inherit" /> : <PlayArrow />}
              </IconButton>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1">Input:</Typography>
              <TextField
                fullWidth
                value={testCase.input}
                margin="normal"
                disabled
              />
              <Typography variant="subtitle1">Expected Output:</Typography>
              <TextField
                fullWidth
                value={testCase.expectedOutput}
                margin="normal"
                disabled
              />
              <Typography variant="subtitle1">Code Output:</Typography>
              <TextField
                fullWidth
                value={testCase.output || 'Run the code to see output'}
                margin="normal"
                disabled
              />
              <Box mt={2}>
                {testResults[index] === true && (
                  <CheckCircle style={{ color: 'green' }} />
                )}
                {testResults[index] === false && (
                  <Cancel style={{ color: 'red' }} />
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      </Box>
  )}

      {/* Right side: Code Editor and Language Selection */}
      <Box sx={{ flex: isMobile ? 'none' : 2, width: isMobile ? '100%' : 'auto'  }}>
        <div className='flex gap-2 content-end'>

          {/* focus button - by ishaan */}
      <Button className="" variant="contained" color="secondary" onClick={() => setIsFocusMode(!isFocusMode)}>
  {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
</Button>
{/* download button - by ishaan */}
<button class="custom-button" onClick={handleSaveCode}>
  <span class="button-text">Save Code</span>
  <span class="button-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 35"
      class="svg-icon"
    >
      <path
        d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"
      ></path>
      <path
        d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"
      ></path>
      <path
        d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"
      ></path>
    </svg>
  </span>
</button>

{/* show solution button by ishaan */}
<Button variant="contained" color="primary" onClick={handleClickOpen}>
        Solution
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className="flex gap-x-72">Answer to the Question <div className="justify-end"><button className='bg-red-500 ml-4' onClick={handleClose}><CloseIcon></CloseIcon></button></div></DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Here is the detailed solution to the question. The response includes explanations and code snippets to provide a comprehensive understanding of the solution approach.
          </Typography>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            {`def example_function():  # Code snippet\n    return "Example Output"`}
          </pre>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <Button variant="contained" color="primary">
              Analyze Time Complexity
            </Button>
            <Button variant="contained" color="primary">
              Analyze Space Complexity
            </Button>
          </div>
        </DialogContent>
      </Dialog>      
</div>

{/* yaha se toh apna code hai hi */}
  {/* <CodeMirror
    value={code}
    height="400px"
    theme={oneDark}
    extensions={[
      language === 'cpp' ? cpp() : 
      language === 'python' ? python() : 
      language === 'javascript' ? javascript() : 
      java() 
    ]}
    onChange={(value) => setCode(value)}
  /> */}
<MonacoEditor
        height="500px"
        language="cpp"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        options={{
          fontFamily: 'Courier New, monospace',
          fontSize: 14,
        }}
      /> 
      <p>{inlineSuggestion}</p>    
  {/* yeh woh action bar hai jo chal ni rha */}
     <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: { xs: 1, sm: 1, md: 3 }, 
      backgroundColor: '#f5f5f5',
      p: 0.5,  
      mt: { xs: 2, sm: 2, md: 3 },  
      borderRadius: '4px',
      boxShadow: { xs: 1, sm: 2, md: 3 },  
      width: { xs: 'auto', sm: 'auto' },
      flexWrap: 'wrap',   
    }}
    
  
    >
      {['{}', '()', '[]', 'if', 'else', 'for','<>','vector'].map((symbol, idx) => (
        <Button key={idx} variant="text" size="small" onClick={() => insertText(symbol)}>
          {symbol}
        </Button>
      ))}
    </Box>

{/* Language bar */}
  <Box mt={3}>
    <Select
      value={language}
      onChange={handleLanguageChange}
      fullWidth
    >
      <MenuItem value="cpp">C++</MenuItem>
      <MenuItem value="python">Python</MenuItem>
      <MenuItem value="javascript">JavaScript</MenuItem>
      <MenuItem value="java">Java</MenuItem>
    </Select>
  </Box>
  {error && (
    <div style={{ marginTop: '16px', color: 'red', whiteSpace: 'pre-line' }}>
        {error}
    </div>
)}


        {/* Tabs for Test Cases */}
        <Box mt={3}>
          <Tabs
            value={activeTestCase}
            onChange={(event, newValue) => setActiveTestCase(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Test Cases Tabs"
          >
            {testCases.map((_, index) => (
              <Tab label={`TestCase ${index + 1}`} key={index} />
            ))}
            <Button onClick={addTestCase} style={{ marginLeft: '10px' }}>+ Add Test Case</Button>
          </Tabs>

          <Box p={2} border={1} borderRadius={2} style={{ backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1">Input:</Typography>
            <TextField
              fullWidth
              value={testCases[activeTestCase].input}
              margin="normal"
              onChange={(e) => {
                const updatedTestCases = [...testCases];
                updatedTestCases[activeTestCase].input = e.target.value;
                setTestCases(updatedTestCases);
              }}
            />

            <Typography variant="subtitle1">Expected Output:</Typography>
            <TextField
              fullWidth
              value={testCases[activeTestCase].expectedOutput}
              margin="normal"
              onChange={(e) => {
                const updatedTestCases = [...testCases];
                updatedTestCases[activeTestCase].expectedOutput = e.target.value;
                setTestCases(updatedTestCases);
              }}
            />

            <Typography variant="subtitle1">Code Output:</Typography>
            <TextField
              fullWidth
              value={testCases[activeTestCase].output || 'Run the code to see output'}
              margin="normal"
              disabled
            />
             
            {/* Run Button  */}
           <button 
                onClick={() => handleRunCode(activeTestCase)} 
                className={`relative border hover:border-sky-600 duration-500 group cursor-pointer text-sky-50 
                            overflow-hidden h-12 w-48 rounded-md bg-sky-800 p-2 flex justify-center items-center 
                            font-extrabold`}
                disabled={loading} // Disable button while code is running
            >
                <div className="absolute z-10 w-48 h-48 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-900 delay-150 group-hover:delay-75"></div>
                <div className="absolute z-10 w-40 h-40 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-800 delay-150 group-hover:delay-100"></div>
                <div className="absolute z-10 w-32 h-32 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-700 delay-150 group-hover:delay-150"></div>
                <div className="absolute z-10 w-24 h-24 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-600 delay-150 group-hover:delay-200"></div>
                <div className="absolute z-10 w-16 h-16 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-500 delay-150 group-hover:delay-300"></div>
                <p className="z-10">{loading ? <CircularProgress size={24} color="inherit" /> : 'Run'}</p>
            </button>

            <Box mt={2}>
              {testResults[activeTestCase] === true && (
                <CheckCircle style={{ color: 'green' }} />
              )}
              {testResults[activeTestCase] === false && (
                <Cancel style={{ color: 'red' }} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Page;