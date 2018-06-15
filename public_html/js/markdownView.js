
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
        self.mdoutput(turndownService.turndown(self.htmlinput()));
    });
    
    //markdown output observables
    self.mdoutput = ko.observable();
    
    self.originalfilename = ko.observable();
    
    //load html file
    self.htmlfile = ko.observable();
    self.htmlfile.subscribe(function() {
        
        loadFile('html');
    });
    self.htmlfilename = ko.computed(function() {
        return self.originalfilename()? self.originalfilename()+'.html' : '';
    });
    
    //load markdown file
    self.mdfile = ko.observable();
    self.mdfile.subscribe(function() {
        
        loadFile('markdown');
    });
    self.mdfilename = ko.computed(function() {
        return self.originalfilename()? self.originalfilename()+'.md' : '';
    });
    
    var loadFile = function(type) {
        
        var reader = new FileReader();
        
        var input, file;
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
            else
                newHtml = text;
            
            $('.nicEdit-main').html(newHtml);
            
        };
        
        var originalnamearray = file.name.split('.');
        originalnamearray.pop();
        self.originalfilename(originalnamearray.join('.'));
        
        reader.readAsText(file);
    };
    
    self.saveMdFile = function() {
      
        var blob = new Blob([self.mdoutput()], {type: "text/plain;charset=utf-8"});
        
        saveFile(blob, self.mdfilename() ? self.mdfilename() : 'markdown.md');
    };
    
    self.saveHTMLFile = function() {
        
        var blob = new Blob([self.htmlinput()], {type: "text/plain;charset=utf-8"});
        
        saveFile(blob, self.htmlfilename() ? self.htmlfilename() : 'markdown.html');
    };
    
    var saveFile = function(blob, filename) {
        
        saveAs(blob, filename);
    };
    
};

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
        //var value = valueAccessor();
        //var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        //textAreaContentElement.html(value());
    }
};

ko.applyBindings(new MarkDownViewModel());