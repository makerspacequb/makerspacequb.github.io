define(function(){

    var answerCell = 0;

    /**
    * This method is called when marker is executed through the shortcut or the button (Run Marker)
    * It runs the modified code in the kernel and calls the methods to process the commands and show next question (if correct)
    * @param {object} cell - the currently selected cell
    * @param {boolean} stop_on_error - Whether it should stop on an error or not
    */
    var execute_selection = function (cell, stop_on_error) {
        //Kernel is declared and connected
        if (!cell.kernel || !cell.kernel.is_connected()) {
            console.log("Can't execute, kernel is not connected.");
            return;
        }

        //Clears output area TODO: find out why false, true
        cell.output_area.clear_output(false, true);

        //stop_on_error defaults to true if not set
        //=== is used to check data type and value at the same time
        if (stop_on_error === undefined) {
            stop_on_error = true;
        }

        //TODO: Find out what this is
        var old_msg_id = cell.last_msg_id;

        //TODO: WTH?
        if (old_msg_id) {
            cell.kernel.clear_callbacks_for_msg(old_msg_id);
            if (old_msg_id) {
            }
        }

        //Shows to user that the cell is running
        //Sets cell to * (means running in jupyter)
        cell.set_input_prompt('*');
        //kernel message set to running
        cell.element.addClass("running");
        //gettting cell callbacks
        var callbacks = cell.get_callbacks();
        //using HTML to get all cells
        var cells = document.getElementsByClassName("cell");

        //call process commands (checking for hidden commands such as show all)
        processCommands(cell,cells);

        //Finds the index of currently selected cell
        var index;
        for(i = 0; i < cells.length; i++){
            if(Jupyter.notebook.get_cell(i) == cell){
                index = i;
                break;
            }
        }

        //Finds Question number by looking at cells above until it finds "Task " then a number extracting the number
        var questionNum = 0;
        for(i = index; i > 0; i--){
            if(cells[i].getElementsByTagName("h2").length > 0){
                //todo add validation that it is task-
                //find first H2 tag above cell and extract its question number
                questionNum = cells[i].getElementsByTagName("h2")[0].id.substring(5);
                break;
            }
        }

        //calls modifycode to add capture output for running marking
        var code = modifyCode(cell, questionNum);

        //debug log
        console.log(code)

        //This where the code is executed in kernel
        cell.last_msg_id = cell.kernel.execute(code, callbacks, {silent: false, store_history: true, stop_on_error : stop_on_error});

        //display next question if correct
        load_next_question(cells,index, questionNum);

        //TODO; make additonal notes
        cell.render();
        cell.events.trigger('execute.CodeCell', {cell: cell});
    };

    /**
    * This method processes hidden commands with the extension. Commands are executed by running in code cell.
    * Show Answers: Displays top code cell
    * Hide Answers: Hides top code cell
    * Show All: Shows all cells (questions) except top code cell
    * @param {object} cell - the currently selected cell
    * @param {object} cells - An array of the cells in the notebook
    */
    var processCommands = function(cell, cells){
        //initial = show
        //none = hide
        if(cell.get_text().toLowerCase().includes("show answers")){
            cells[answerCell].style.display = 'initial';
        }
        else if(cell.get_text().toLowerCase().includes("hide answers")){
            cells[answerCell].style.display = 'none';
        }
        else if(cell.get_text().toLowerCase().includes("show all")){
            for(i = 1; i < cells.length; i++){
                cells[answerCell+1].style.display = 'initial';
            }
        }
    }

    /**
    * This method gets the code in the currently selected cell and;
    * -Runs marking assets: Fetches all code in the first notebook cell after the comment '#Mark'
    * -Captures conole output: Adds python code to save console output to out.txt
    * @param {object} cell - the currently selected cell
    * @param {number} questionNum - The question number they are currently on
    * @return {string} code - the modified code
    */
    var modifyCode = function(cell, questionNum){
        //fetching code after #Mark in first notebook cell
        var marker = Jupyter.notebook.get_cell(answerCell).get_text().split('#Mark')[1];
        //taking all current cell lines
        lines = cell.get_text().split('\n');
        cellCode = "";
        
        //this indents code so it can go in try except block
        for(j =0; j < lines.length; j++){
            cellCode += "\t"+lines[j]+"\n";
        }

        //set code to 'pass' if empty
        if(cellCode == ""){
            cellCode = "\tpass\n";
        }

        //name of output file
        outputFile = "out.txt"

        //building the python code to be executed for marking
        //fetching imports (traceback from IPython) with markdown
        code = "import traceback\nfrom IPython.display import Markdown, display\n"

        //try to open text file and also set console out to text file and console (Tee method)
        code += "try:\n\tf = open('"+ outputFile +"', 'w')\n\toriginal = sys.stdout\n\tsys.stdout = Tee(sys.stdout, f)\n"

        //adding an exception to output "Rerun all cells" error message if this fails (ass this means first cell hasn't been run in notebook)
        code += "except:\n\tcolorstr = \"<span style='color:{}'>{}</span>\".format('red', '**Rerun all cells**')\n\tdisplay(Markdown(colorstr))\n"

        //trying to execute cell code and printint traceback if fails to compile. (Also close text file).
        code += "try:\n" + cellCode + "\nexcept:\n\ttraceback.print_exc()\ntry:\n\tsys.stdout = original\n\tf.close()\nexcept:\n\tpass\n";
        
        //This allows the marking code to access the code text
        code += "\ncode = \""+escape(cell.get_text())+"\"";
        
        //This allows marking code access to the current question number and adds marking code
        code += "\nnum = "+ questionNum +"\n" + marker;
        return code;
    }

    /**
    * This method reads a text file returning the contents
    * @param {string} file - The location and name of the file you want to read including file extension
    * @return {string} text - The text inside file given
    */
    var readTextFile = function (file){
        //text set to -1 (used for error checking if no text file is found)
        text = "-1";
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            //file ready state
            if(rawFile.readyState === 4)
            {
                //200 = OK
                if(rawFile.status === 200)
                {
                    //get text
                    text = rawFile.responseText;
                }
            }
        }
        //returning nothing to rawFile request
        rawFile.send(null);
        return text;
    }

    /**
    * This method takes the question they are on and if they got it right it displays the next question
    * @param {object} cells - An array of the cells in the notebook
    * @param {number} index - The index of the currently selected cell
    * @param {number} questionNum - The question number they are currently on
    */
    var load_next_question= function (cells, index, questionNum) {
        //setting file for recording correct question numbers
        var file = "correct.txt";
        //Sleep is needed as sometimes this method was called before python finished writing to text file
        sleep(500);
        correct = readTextFile(file);
        //text file only number of currently completing questions
        if(parseInt(correct) == parseInt(questionNum)){
            //sets evreythign to be shown up to but not including 2 questions ahead
            //i.e. if on question 1, sets everything to be shown up to but not including question 3. Which translates to question 2
            nextQuestion = parseInt(questionNum) +2;
            for(i = index; i < cells.length;i++){
                //finding cell of matching question id
                if(cells[i].getElementsByTagName("h2").length > 0 && cells[i].getElementsByTagName("h2")[0].id == "Task-"+nextQuestion)
                    //when found breaks to stop loading more cells
                    break;
                //for each cell set to show (initial = visible)
                cells[i].style.display = 'initial';
            }
        }
    }

    /**
    * This method is for the keyboard shortcut. It finds the cell currently selected and runs execute selection on it
    */
    var run_cell_selection  = {
        help: 'run the current seleciton of the curent focused cell',
        icon : 'fa-recycle',
        help_index : '',
        handler : function (env) {
            console.info("executing selection")
            var cell = env.notebook.get_selected_cell(); 
            execute_selection(cell)
        }
    }

    /**
    * This is a basic sleep method for javascript
    */
    function sleep(ms) {
        var unixtime_ms = new Date().getTime();
        while(new Date().getTime() < unixtime_ms + ms) {}
    }

  return {
    /**
    * This method is run when the extension is being loaded
    */
    load_ipython_extension: function(){
        //checks the first cell contains #marker if not extension is not loaded
        if(Jupyter.notebook.get_cell(answerCell).get_text().split("\n")[0]=="#marker"){

            //Hides all cells after the one they are currently on
            var cells = document.getElementsByClassName("cell");
            for(i = 0; i < cells.length;i++){
                //hides every cell
                cells[i].style.display = 'none';
            }

            //gets all text cells
            var textCells = document.getElementsByClassName("text_cell");
            var textCell;
            //integer value found in correct.txt to set number of cells visible
            var tillQuestion = parseInt(readTextFile("correct.txt"));
            if(!Number.isInteger(tillQuestion) || tillQuestion < 1){
                //invalid or no questions have been done
                tillQuestion = 2;
            }
            else{
                //sets questions to show to loaded value from text file += 2
                tillQuestion += 2;
            }
            for(i = 0; i <textCells.length; i++){
                //finding cell of matching question id
                if(textCells[i].getElementsByTagName("h2").length > 0 && textCells[i].getElementsByTagName("h2")[0].id == "Task-"+tillQuestion){
                    //sets current text to cell at index
                    textCell = textCells[i];
                    break;
                }
            }
            i = 1;
            while(textCell != cells[i]){
                //goes through all cells up until current and sets visible
                cells[i].style.display = 'initial';
                i++;
            }

            //adds marker button to tool bar
            IPython.toolbar.add_buttons_group([
                {   
                'label'   : 'Run Marker',
                'icon'    : 'ui-icon-calculator',
                'callback': function(){
                    console.info("executing selection")
                    var cell = IPython.notebook.get_selected_cell(); 
                    execute_selection(cell)}
                } 
            ]); 
            
            //adds keyboard shortcut for marker
            var action_name = IPython.keyboard_manager.actions.register(run_cell_selection, 'run-current-cell-selection', 'issue-252')
            IPython.keyboard_manager.edit_shortcuts.add_shortcut('Ctrl-Enter', action_name) 
        }

    }, 
  };
})