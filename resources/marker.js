define(function(){

    var execute_selection= function (cell, stop_on_error) {
        if (!cell.kernel || !cell.kernel.is_connected()) {
            console.log("Can't execute, kernel is not connected.");
            return;
        }

        cell.output_area.clear_output(false, true);

        if (stop_on_error === undefined) {
            stop_on_error = true;
        }

        var old_msg_id = cell.last_msg_id;

        if (old_msg_id) {
            cell.kernel.clear_callbacks_for_msg(old_msg_id);
            if (old_msg_id) {
            }
        }
        cell.set_input_prompt('*');
        cell.element.addClass("running");
        var callbacks = cell.get_callbacks();
        if(cell.get_text().toLowerCase().trim() == "show answers"){
            document.getElementsByClassName("input")[0].style.display = 'initial';
            document.getElementsByClassName("output")[0].style.display = 'initial';
        }
        else if(cell.get_text().toLowerCase().trim() == "hide answers"){
            document.getElementsByClassName("input")[0].style.display = 'none';
            document.getElementsByClassName("output")[0].style.display = 'none';
        }
        var questions = Jupyter.notebook.get_cell(0).get_text().split('#Question ');
        var code = cell.get_text();
        code = "f = open('out.txt', 'w')\noriginal = sys.stdout\nsys.stdout = Tee(sys.stdout, f)\n" + code + "\nsys.stdout = original\nf.close()\n";
        for(i = 1; i < questions.length; i++){
            questions[i] = '#Question ' + questions[i];
            if(cell.get_text().split('\n')[0].toLowerCase().trim() == questions[i].split('\n')[0].toLowerCase().trim()){
                code += questions[i];
                break;
            }
        }
        console.log(code)
        cell.last_msg_id = cell.kernel.execute(code, callbacks, {silent: false, store_history: true,
            stop_on_error : stop_on_error});
        cell.render();
        cell.events.trigger('execute.CodeCell', {cell: cell});
        console.info(cell.kernel)
    };

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

  return {
    load_ipython_extension: function(){
        var action_name = IPython.keyboard_manager.actions.register(run_cell_selection, 'run-current-cell-selection', 'issue-252')
        console.info(document.getElementsByClassName("input")[1].style.display)
        document.getElementsByClassName("input")[0].style.display = 'none';
        document.getElementsByClassName("output")[0].style.display = 'none';
        IPython.toolbar.add_buttons_group([
            {   
            'label'   : 'run marker',
            'icon'    : 'ui-icon-calculator',
            'callback': function(){
                console.info("executing selection")
                var cell = IPython.notebook.get_selected_cell(); 
                execute_selection(cell)}
            } 
        ]); 
        
        IPython.keyboard_manager.edit_shortcuts.add_shortcut('Ctrl-Enter', action_name) 

    }, 
  };
})