
function MarkDownViewModel() {
  
    var self = this;
    
    //html -> markdown
    var turndownService = new TurndownService({
        headingStyle: 'atx'
    });
    
    //markdown -> html
    var showdownService = new showdown.Converter();
    
    //html input observables
    self.htmlinput = ko.observable();
    self.htmlinput.subscribe(function() {
        // a change to the htmlinput triggers an update to the markdown
        self.mdoutput(turndownService.turndown(self.htmlinput()));
    });
    
    //markdown output observables
    var timer = null;
    self.mdoutput = ko.observable();
    self.mdoutput.subscribe(function() {
        
        //a change to the markdown triggers an update to the html
        //however we need to avoid an infinte loop
        //so we check if the html we would be creating matches the
        //existing html already displayed. If there is no change we
        //do nothing.
        var newHtml = showdownService.makeHtml(self.mdoutput());
        
        //if the html differs from what is already displayed
        if (self.htmlinput() !== newHtml) {
            
            //clear any previous timeout on the update
            clearTimeout(timer);
            
            //set a new timre to update the html in 1.5 seconds
            timer = setTimeout(function(){ 
                setHtml(newHtml);
            }, 1500);
        }
        else
            clearTimeout(timer);
    });
    
    //original file name of the opened file minus the extension
    self.originalfilename = ko.observable();
    
    //load html file
    self.htmlfile = ko.observable();
    self.htmlfile.subscribe(function() {
        
        //when the selected html file to open changes
        //load it from disk
        if (self.htmlfile())
            loadFileFromDisk('html');
    });
    self.htmlfilename = ko.computed(function() {
        return self.originalfilename()? self.originalfilename()+'.html' : '';
    });
    
    //load markdown file
    self.mdfile = ko.observable();
    self.mdfile.subscribe(function() {
        
        //when the selected md file to open changes
        //load it from disk
        if (self.mdfile())
            loadFileFromDisk('markdown');
    });
    self.mdfilename = ko.computed(function() {
        return self.originalfilename()? self.originalfilename()+'.md' : '';
    });
    
    //clear both the html and markdown
    self.clearAll = function() {
      
        $('.nicEdit-main').html('<br>');
        self.originalfilename('');
    };
    
    //set the html to be displayed
    //this will trigger a markdown update
    var setHtml = function(html) {

        if (html)
            $('.nicEdit-main').html(html);
        
    };
    
    //start the process of loading a file from disk based on which
    //open button was clicked. Clicks the correct hidden file input.
    self.loadFile = function(data, event) {
        
        var inputctrl;
        if (event.target.id === 'openhtmlbtn') {
            self.htmlfile('');
            inputctrl = $('#uploadhtml');
        }
        else {
            self.mdfile('');
            inputctrl = $('#uploadmd');
        }
        
        inputctrl.trigger('click');
    };
    
    //loads the file contents from disk
    var loadFileFromDisk = function(type) {
        
        var reader = new FileReader();
        
        var input, file;
        
        //determine the file input to get the file from
        if (type === 'markdown')
            input = '#uploadmd';
        else
            input = '#uploadhtml';
        
        file = $(input)[0].files[0];
        
        reader.onload = function() {
           
            var text = reader.result;
            
            var newHtml;
            if (type === 'markdown')
                newHtml = showdownService.makeHtml(text);
            else {
                //we convert first to markdown then to html to avoid unneccessary
                //updates in the ui. If we did not, we had problems where the html
                // would trigger th emarkdown update, which would trigger an html
                //update because the markdown would be different than the raw html
                newHtml = showdownService.makeHtml(turndownService.turndown(text));
            }

            setHtml(newHtml);
            
        };
        
        //get the original file name without extension
        var originalnamearray = file.name.split('.');
        originalnamearray.pop();
        self.originalfilename(originalnamearray.join('.'));
        
        //read the file as text
        reader.readAsText(file);
    };
    
    //save the MD file to disk
    self.saveMdFile = function() {
      
        var blob = new Blob([self.mdoutput()], {type: "text/plain;charset=utf-8"});
        
        saveFile(blob, self.mdfilename() ? self.mdfilename() : 'markdown.md');
    };
    
    //save the html file to disk
    self.saveHTMLFile = function() {
        
        var blob = new Blob([self.htmlinput()], {type: "text/plain;charset=utf-8"});
        
        saveFile(blob, self.htmlfilename() ? self.htmlfilename() : 'markdown.html');
    };
    
    
    var saveFile = function(blob, filename) {
        
        saveAs(blob, filename);
    };
    
};

//custom binding for the necedit control
ko.bindingHandlers.nicedit = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        var area = new nicEditor({
            buttonList : ['bold','italic','ol','ul','removeformat','hr','link','unlink','fontFormat'],
            iconsPath: 'js/nicEdit/nicEditorIcons.gif',
            maxHeight: 700
        }).panelInstance(element.id, {hasPanel : true});
        $(element).text(ko.utils.unwrapObservable(value)); 

        // function for updating the right element whenever something changes
        var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        var areachangefc = function() {
            value(textAreaContentElement.html());
        };

        // Make sure we update on both a text change, and when some HTML has been added/removed
        // (like for example a text being set to "bold")
        $(element).prev().keyup(areachangefc);
        $(element).prev().bind('DOMNodeInserted DOMNodeRemoved', areachangefc);
    },
    update: function(element, valueAccessor) {
        //THIS DOES NOT WORK AND UPDATE SHOULD NOT BE USED!
        //the update binding causes the event bindings above to fire
        //resulting in an infinite loop of binding updates!
        //
        //var value = valueAccessor();
        //var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        //textAreaContentElement.html(value());
    }
};

ko.applyBindings(new MarkDownViewModel());