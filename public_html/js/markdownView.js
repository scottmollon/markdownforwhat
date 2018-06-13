
function MarkDownViewModel() {
  
    var self = this;
    
    var turndownService = new TurndownService({
        headingStyle: 'atx'
    });
    
    self.htmlinput = ko.observable();
    self.htmlinput.subscribe(function() {
        self.mdoutput(turndownService.turndown(self.htmlinput()));
    });
    
    self.mdoutput = ko.observable();
    
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