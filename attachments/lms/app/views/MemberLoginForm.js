$(function () {

    App.Views.MemberLoginForm = Backbone.View.extend({
        template: $('#template-login').html(),
        vars: {},
        className: "form",

        events: {
            "click #formButton": "setForm",
            "submit form": "setFormFromEnterKey"
        },

        render: function () {
            // create the form
             var configurations=Backbone.Collection.extend({

    				url: App.Server + '/configurations/_all_docs?include_docs=true'
    		})	
    	    var version=''
            var config=new configurations()
    	        config.fetch({async:false})
    	    var currentConfig=config.first()
            var cofigINJSON=currentConfig.toJSON()
    	    version=cofigINJSON.rows[0].doc.version
    	    this.vars.versionNO=version
    	    
            this.$el.html(_.template(this.template, this.vars))
            
            this.form = new Backbone.Form({
                model: this.model
            })
            this.$el.append(this.form.render().el)
            // give the form a submit button
            var $button = $('<a class="btn btn-success" id="formButton">Sign In</button>')
            var $btnBecomeaMember = $('&nbsp&nbsp<a class="btn btn-success" href="#becomemember">Become a Member</button>')
            this.$el.append($button)
            this.$el.append($btnBecomeaMember)
        },

        setFormFromEnterKey: function (event) {
            event.preventDefault()
            this.setForm()
        },
		setForm: function () {
        	
            var memberLoginForm = this
            this.form.commit()
            var credentials = this.form.model

            console.log("LMS::App::Views::MemberLoginForm.js::setForm():: credentials: " +
                            JSON.stringify(this.form.model));

            $.getJSON('/members/_design/bell/_view/MembersByLogin?include_docs=true&key="' + credentials.get('login') + '"', function (response) {

//                console.log("LMS::App::Views::MemberLoginForm.js::setForm():: response.rows[0]: " +
//                    JSON.stringify(response.rows[0]));
//                console.log("<------****----->");
//                console.log("LMS::App::Views::MemberLoginForm.js::setForm():: response.rows[1]: " +
//                    JSON.stringify(response.rows[1]));

                if (response.rows[0]) {
                    if (response.total_rows > 0 && response.rows[0].doc.password == credentials.get('password')) {
                        if (response.rows[0].doc.status == "active") {
                            //member visists
                            var memvisits = new App.Models.Member({
                                _id: response.rows[0].doc._id
                            })
                            memvisits.fetch({
                                async: false
                            });

//                            console.log("memvisits 1" + JSON.stringify(memvisits));


                            memvisits.set("visits", memvisits.get("visits") + 1)
                            memvisits.once('sync', function () {
                                var date = new Date();
                                $.cookie('Member.login', response.rows[0].doc.login, {
                                    path: "/apps/_design/bell"
                                })
                                $.cookie('Member._id', response.rows[0].doc._id, {
                                    path: "/apps/_design/bell"
                                })
                                $.cookie('Member.expTime', date, {
                                    path: "/apps/_design/bell"
                                })

                                var tempUser = JSON.stringify(memvisits.toJSON());
                                $.cookie('Member.mod', tempUser, {
                                    path: "/apps/_design/bell"
                                });

//                                console.log( tempUser );

//                                alert(JSON.stringify(response.rows.length));

                                if ($.inArray('student', response.rows[0].doc.roles) != -1) {
                                    if (response.rows[0].doc.roles.length < 2) {
                                        alert("You are not authorized to sign in")
                                    } else {
                                        memberLoginForm.trigger('success:login')
                                    }
                                } else {
                                    memberLoginForm.trigger('success:login')
                                }
                            })
                            memvisits.save()
                            //-----------------------

                        } else {
                            alert("Your account is deactivated")
                        }
                    } else {
                        alert('Login or Password incorrect.')
                    }
                } else {
                    alert('Login or Password incorrect.')
                }
            });
        },


    })
})