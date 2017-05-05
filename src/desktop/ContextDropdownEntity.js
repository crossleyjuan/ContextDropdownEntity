bizagi.rendering.basicUserField.extend("bizagi.rendering.ContextDropdownEntity",{}, {

    /*************************************************************/
    /* methods to be overriden by the implementations            */
    /*************************************************************/
    getEditableControl: function () {
        return this.getGenericControl();
    },
    getReadonlyControl: function () {
        return this.getGenericControl();
    },
    
    getBoolean: function(val) {
        var result = (val == "true" || val == true);
        return result;
    },
    
    initializeControl: function() {
        var self = this;
        
        if (self.initialized == true) {
            return;
        }
        
        self.properties.allowempty = (self.properties.allowempty != undefined) ? self.getBoolean(self.properties.allowempty): true;
        self.properties.texteditable = (self.properties.texteditable != undefined) ? self.getBoolean(self.properties.texteditable): true;
        self.properties.emptytext = (self.properties.emptytext != undefined) ? self.properties.emptytext: "-";
        if (self.properties.designMode == "true" || self.properties.designMode == true) {
            self.properties.internalData = [ { id: 1, value: 'test1'}, { id: 2, value: 'test2' }]
            self.properties.value = "1";
            self.properties.designMode = true;
        } else {
            self.properties.internalData = JSON.parse(self.properties.data);
            self.properties.designMode = false;
        }
            
        if (self.getBoolean(self.properties.allowempty)) {
            var emptyValue = { id: undefined, value: self.properties.emptytext }
            self.properties.internalData.splice(0, 0, emptyValue);
        }

        self.initialized == true;
    },
    
    getGenericControl: function () {
        //standard initialization
        var self = this;
        var control = self.getControl();
        var properties = self.properties;
        var extendedData = self.extendedData;
        
        // Check defaults
        try {
            debugger;
            self.initializeControl();
            
            //console.log('getGenericControl data: ' + self.properties.internalData);
            var template = [
                '<div class="ui-selectmenu"><div class="ui-select-data-container">',
                '<input class="ui-select-data ui-selectmenu-value" type="text"  role="textbox" id="${id}" value="${value}" />',
                '</div>',
                '<div class="ui-selectmenu-btn"><i class="biz-btn-caret"></i></div>',
                '</div>'].join("\n");
            
            var result = self.findDataById(self.properties.value);
            self.myinput = $.tmpl(template, result);
            
            if ((self.properties.value == undefined) || (self.properties.value == "")) {
                var input = $("input", self.myinput);
                input.val("Please select...");
            }
            console.log(self.properties.texteditable);

            if (!self.getBoolean(self.properties.texteditable)) {
                var input = $("input", self.myinput);
                // If jquery > 1.9
                if (input.prop) {
                    input.prop("readonly", true);
                } else {
                    input.attr("readonly", true);
                }
            }
            
            self.inputCombo = self.inputCombo = $(".ui-selectmenu-value", self.myinput);
            self.selectedValue = result;

            if (!self.properties.designMode) {
                self.configureBindings();
            }
        } catch (e) {
            self.myinput = $("<div>Error</div>");
        }
        return self.myinput;
    },
    
    configureBindings: function () {
        var self = this;
        var control = self.getControl();

        if (self.properties.designMode == true)
            return;
            
        self.inputCombo.focus(function () {
            $(this).select();
        });

        self.inputCombo.click(function () {
            var idDropdown = "dd-" + self.inputCombo.attr("id");
            if ($("#" + idDropdown).parent().length === 0) {
                self.comboDropDown();
            } else {
                // Close combo if clicked twice 
                self.dropDownDestroy($("#" + idDropdown));
            }
            self.inputCombo.focus();
        });

        // Bind clicks to fake UI in order to simulate select clicks
        if ($(".ui-selectmenu-btn", self.myinput).length > 1 && typeof (window.addEventListener) != "undefined")
            $(".ui-selectmenu-btn", self.myinput)[0].addEventListener("click", function () {
                self.inputCombo[0].click();
            });
        else
        $(".ui-selectmenu-btn", self.myinput).bind("click.combo", function () {
            self.inputCombo.trigger("click");
        });

        self.inputCombo.keyup(function (e) {
            self.keyUpFunction(e);
        });

        self.inputCombo.keydown(function (e) {
            self.keyDownFunction(e);
        });
    },
    
    /*
    *   Makes the combo drops down, also fetch the data first if the combo is set to load on demand
    */
    comboDropDown: function () {
        var self = this;

        var control = self.getControl();
        var properties = self.properties;
        var extendedData = self.extendedData;
        //self.showLoadingData();

        var data = properties.internalData;
        
//        self.hideLoadingData();
        try {
            self.internalComboDropDown(data);

            if (typeof Windows != "undefined" && self.grid) {
                $(self.grid.element).find(".bz-rn-grid-data-wraper").css("overflow", "hidden");
            }
        } catch (e) {
            bizagi.log(e.message);
        }

    },
    
    collectData: function(result) {
        var self = this;
        var properties = self.properties;
        if (self.selectedValue) {
            result[properties["xpath"]] = self.selectedValue['id'];
        }
    },
    
    /*
    *   Find elements within a data source
    */
    findDataById: function (id) {
        var self = this;
        var result = {};
        if (self.properties.internalData) {
            $.each(self.properties.internalData, function (key, value) {
                if (value.id == id) {
                    result = value;
                }
            });
        }

        return result;

    },
    /*
    *
    */
    findDataByValue: function (val, keyByKey) {
        var self = this;
        var result = -1;

        if ((val !== undefined && val !== null) && (self.properties.internalData != undefined)) {
            if (keyByKey) {

                var i = -1;
                var dataLength = self.properties.internalData.length - 1;
                var value;

                var tvalue,
                    nValue;

                var compareValIn,
                    compareVal;

                while (i++ < dataLength) {
                    value = self.properties.internalData[i];
                    compareValIn = (typeof val == 'object') ? val.join(" - ") : (typeof val === 'boolean') ? val.toString() : val;
                    compareVal = $.trim(compareValIn).substring(0, compareValIn.length).toLowerCase();

                    if (typeof value === 'object' && typeof value.value === 'object') {
                        tvalue = (typeof value.value == 'object') ? value.value.join(" - ") : value.value;
                    } else {
                        tvalue = $.trim(value.value);
                    }
                    nValue = String(tvalue).toLowerCase();

                    //Find the first ocurrence, without writing the complete element
                    if (nValue.indexOf(compareVal) != -1) {
                        result = { id: value.id, value: value.value };
                        i = dataLength;
                    }
                }
            }
            else {
                if (self.getValue()) {
                    result = self.getValue();
                    if (!result.value) {
                        result.value = self.inputCombo.val();
                    }
                }
            }
        }

        return result;
    },
    /*
    *   Draws the mini-popup
    */
    internalComboDropDown: function (data) {
            debugger;
        $(".ui-select-dropdown.open").remove();
        var self = this, selectTmp = {}, objSelected = {};
        /** temp templates **/
        var tempCombo = "<ul>{{each datasource}}{{if typeof hidden == 'undefined'}}<li data-value='${id}'>${value}</li>{{/if}}{{/each}}</ul>";
        var containerDropdown = $("<div class='ui-select-dropdown open'></div>");
        /* control reference */
        var containerControl = self.inputCombo.closest('.ui-bizagi-control');
        var containerRender = containerControl.closest('.ui-bizagi-render');
        var idDropdown = "dd-" + self.inputCombo.attr("id");
        var selectedValue = self.findDataByValue(self.inputCombo.val());
        var scrollPosition = 0;
        var orientation = (self.properties.orientation === 'rtl') ? 'ui-bizagi-rtl' : '';

        //fix for QA-507 only IE
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            var contFormScroll = containerRender.closest(".ui-dialog-content");
            if (contFormScroll.length > 0) {
                contFormScroll.css('overflow-y', 'hidden');
            }
        }
        data = data || self.properties.internalData;
        self.properties.internalData = data;

        self.repositionInterval;
        var height = containerRender.css("height");
        containerRender.addClass("ac-is-visible");
        // fix for SUITE-9458
        containerRender.css("height", height);
        containerControl.addClass("ac-is-visible ac-clear-floats");

        containerDropdown.attr("id", idDropdown);

        for (var i = 0; i < data.length; i++) {
            if (data[i].value !== null && typeof (data[i].value) == "boolean") {
                if (bizagi.util.parseBoolean(data[i].value) == true) {
                    data[i].value = this.getResource("render-boolean-yes");

                } else if (bizagi.util.parseBoolean(data[i].value) == false) {
                    data[i].value = this.getResource("render-boolean-no");
                }
            }
        }
        if (data.length > 1000) selectTmp = self.getResource("render-combo-too-many-elements");
        else
            selectTmp = $.tmpl(tempCombo, { datasource: data });
        var dropDwn = containerDropdown.append(selectTmp);
        containerControl.append(dropDwn);
        var objParent = $(".ui-selectmenu", self.control);
        $(dropDwn).find("li:last-child").css("padding-bottom", "13px");

        dropDwn.width(objParent.width());

        dropDwn.position({
            my: "left top",
            at: "left bottom",
            of: $(".ui-selectmenu", self.control),
            collision: "fit"
        }).hide();

        //dropDwn.fadeIn();
        dropDwn.show();
        //fix for QA-507 only IE
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            if (contFormScroll.length > 0) {
                contFormScroll.css('overflow-y', 'auto');
            }
        }

        //SUITE 9379 - ComboBox offset in resizing when the combobox is opened
        self.recalculateComboOffset(dropDwn, objParent);

        dropDwn.data('formWidth', containerControl.width());
        dropDwn.data('parentCombo', self.control);

        dropDwn.addClass(orientation);

        if ((selectedValue !== -1) && ($("li", dropDwn).length > 0)) {

            //Checks if the selected element is empty string, it's normal for cascading combos
            if (selectedValue && selectedValue.id == '')
                objSelected = $("li[data-value='']", dropDwn);
            else
                objSelected = $("li[data-value='" + selectedValue.id + "']", dropDwn);

            if (objSelected.length != 0) {
                objSelected.addClass('ui-selected');
                objSelected.addClass("active");
                scrollPosition = parseInt(objSelected.position().top);
                dropDwn.scrollTop(scrollPosition);
            }
        }

        dropDwn.delegate("li", "click", function () {
            var valId = ($(this).data('value')) ? $(this).data('value') : '';
            var val = { id: valId, value: $(this).text() };

            //Prevents stores the value twice when the element seached match with the clicked
            //It helps to keep track the last selected
            var id = self.getValue();
            id = id && id.id ? id.id : 0;
            if (val.id !== id) {
                self.onComboItemSelected(val);
            } else {
                if (val.value !== self.inputCombo.val()) {
                    self.setDisplayValue({ value: val.value });
                }
            }

            //'select' will stand at first character of the string, 'focus' will stand at the last character of the string
            self.inputCombo.select();

            // Animation effect
            /*dropDwn.fadeOut('slow', function () {
            self.dropDownDestroy(dropDwn);
            });*/
            dropDwn.hide();
            self.dropDownDestroy(dropDwn);

            $(document).unbind("click.closecombo");
            
            //Forces the reload
            /*
            self.saveForm().done(function() {
                self.refreshForm();
            });
            */
        });

        // Stop bubbling outside the dropdown
        $.makeArray(dropDwn, self.getControl()).bind('click', function (e) {
            e.preventDefault();
            return false;
        });

        /*fix for IE*/
        dropDwn.bind('mousedown.closecombo', function () {
            dropDwn.attr('md', true);
        });

        $(document).one("click.closecombo", function (e) {
            var tg = $(e.target);
            if (!dropDwn.attr('md')) { /* <-- fix for IE*/
                self.dropDownValidClose(tg, dropDwn);
            } else {
                dropDwn.removeAttr('md');
            }
        });

    },
    /*
    * destroy dropdown
    */
    dropDownDestroy: function (dropDown) {
        var self = this;
        var containerControl = self.inputCombo.closest('.ui-bizagi-control');
        var containerRender = containerControl.closest('.ui-bizagi-render');

        // fix for SUITE-9507
        if (containerControl.hasClass("ac-is-visible")) {
            containerControl.removeClass("ac-is-visible");
        }
        if (containerControl.hasClass("ac-clear-floats")) {
            containerControl.removeClass("ac-clear-floats");
        }
        containerRender.css("height", "auto");
        if (containerRender.hasClass("ac-is-visible")) {
            containerRender.removeClass("ac-is-visible");
        }

        dropDown.remove();
        $(document).unbind("mousedown.closecombo");
        $(document).unbind("mouseup.resizecombo");
        $(window).unbind('resize.resizecombo');
        $(window).unbind('mouseup.closecombo');
        if (self.repositionInterval) {
            clearInterval(self.repositionInterval);
        }

        if (typeof Windows != "undefined" && self.grid) {
            $(self.grid.element).find(".bz-rn-grid-data-wraper").css("overflow", "auto");
        }
    },
    
    /*
    *   Handler to react when a combo item is selected
    */
    onComboItemSelected: function (val) {
        var self = this;
        var selectedId = val.id || "";
        var selectedLabel = val.value || "";

        self.properties.originalValue = self.getValue();

        if (selectedId === "") {
            self.inputCombo.val(self.properties.emptytext);
        } else {
            self.inputCombo.val(selectedLabel);
        }

        self.selectedValue = { id: selectedId, value: selectedLabel }; 
        
        if (self.properties.submitOnChange) {
            self.saveForm().done(function() {
                self.refreshForm();
            });
        }
//        self.setValue({ id: selectedId });
//        self.setDisplayValue({ value: selectedLabel });
    },

    /*
    *   Sets the value in the rendered control
    */
    setDisplayValue: function (value) {
        var self = this;
        debugger;
        // This is to ensure the values have been initialized as the getGenericControl is not called yet when using readonly
        self.initializeControl();
        try {
            var properties = self.properties;
            var comboValue = '';
            var comboValueValid = true;
            var control;
            
            if (properties.editable && value !== null) {
                // If set display value were assigned from render action
                if (typeof value === "object" && value.label !== undefined) {
                    comboValue = self.findDataById(value.value).value || value.label;
                    self.setValue({ id: value.value, value: value.label });
                } else {
                    if (typeof value === "number" || typeof value === "string" || value.id) {
                        if (value.id) {
    
                            if (value.value != null && typeof value.value == "boolean") {
                                if (bizagi.util.parseBoolean(value.value) == true) {
                                    value.value = this.getResource("render-boolean-yes");
    
                                } else if (bizagi.util.parseBoolean(value.value) == false) {
                                    value.value = this.getResource("render-boolean-no");
                                }
                            } else if (value.value != null && typeof value.value == "object") {
                                for (var i = 0; i < value.value.length; i++) {
                                    if (value.value[i] != null && typeof (value.value[i]) == "boolean") {
                                        if (bizagi.util.parseBoolean(value.value[i]) == true) {
                                            value.value[i] = this.getResource("render-boolean-yes");
    
                                        } else if (bizagi.util.parseBoolean(value.value[i]) == false) {
                                            value.value[i] = this.getResource("render-boolean-no");
                                        }
                                    }
                                }
                            }
                            comboValue = self.findDataById(value.id).value || value.value;
    
                        } else {
                            comboValue = self.findDataById(Number(value)).value || value.label;
                        }
                    } else {
                        comboValue = (typeof value.value == 'object') ? value.value.join(" - ") : value.value;
                    }
    
                    if (properties.hasLocalData || properties.remoteDataLoaded) {
                        comboValueValid = self.findDataByValue(comboValue);
                        if (comboValueValid === -1) {
                            comboValue = '';
                        }
                    }
    
                    if (value && value.id) {
                        // Check if the value is a json object
                        if ((value.id != undefined) && ((typeof value.id == 'number' && value.id > 0) || (typeof value.id == 'string' && value.id.length > 0))) {
                            if (self.value.id != value.id) {
                                self.setValue({ id: value.id });
                            }
                        } else {
                            if (self.value.id != value) {
                                self.setValue({ id: value });
                            }
                        }
                    }
                }
                if ($.isArray(comboValue)) {
                    comboValue = comboValue.join(" - ");
                }
                if (self.inputCombo) {
                    self.inputCombo.val(comboValue);
                } else {
                    control = $(".ui-selectmenu-value", self.getControl());
                    control && control.val(comboValue);
                }
    
            } else {
                if (!properties.editable && value !== null) {
                    if (typeof value === "number" || typeof value === "string") {
                        comboValue = self.findDataById(Number(value)).value;
                        self.getControl().text(self.formatItem(comboValue));
                    }
                } else {
                    if (value === null && properties.editable) {
                        var emptySelection = self.getResource("render-combo-empty-selection");
                        self.inputCombo.val(emptySelection);
                    } else {
                        if (value === null && !properties.editable) {
                            self.getControl().text("");
                        }
                    }
                }
            } 
        } catch (e) {
            self.getControl().text("Error: " + e);
        }
    },
    
    /*
    *   Formats value of each item
    */
    formatItem: function (value) {

        if (value !== undefined && value !== null) {
            if ($.isArray(value)) {

                for (var i = 0; i < value.length; i++) {
                    if (value[i] != null && typeof (value[i]) == "boolean") {
                        if (bizagi.util.parseBoolean(value[i]) == true) {
                            value[i] = this.getResource("render-boolean-yes");

                        } else if (bizagi.util.parseBoolean(value[i]) == false) {
                            value[i] = this.getResource("render-boolean-no");
                        }
                    }
                }
                return value.join(" - ");
            } else {

                return value;
            }
        } else {
            return "";
        }
    },

    recalculateComboOffset: function (dropDwn, objParent) {
        if (bizagi.util.isIE() && (bizagi.util.getInternetExplorerVersion() == 9)) {
            if (dropDwn.width() !== objParent.width()) {
                var offset = objParent.width() - dropDwn.width();
                dropDwn.width(objParent.width() + offset);
            }
        }
    }
    

});