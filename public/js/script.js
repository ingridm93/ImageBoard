var next = 15;

(function () {
    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll('template');

    Array.prototype.slice.call(templates).forEach(function (tmpl) {
        Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
    });

    Handlebars.partials = Handlebars.templates;


    var CardsModel = Backbone.Model.extend({

        url: '/home',

        initialize: function () {
            this.fetch();
        }
    });


    var CardsView = Backbone.View.extend({
        initialize: function () {

            var view = this;
            this.model.on('change', function () {
                view.render();

            });
        },

        render: function () {

            var data = this.model.toJSON();
            console.log(data);

            var images = data.images;

            console.log(images);
            var dataSliced = images.slice(0, 10);
            console.log(dataSliced);

            var html = Handlebars.templates.cards({
                images: dataSliced
            });

            this.$el.html(html);


        },

        events: {

            'click .modal-img': function (e) {
                console.log('click', e.target.id);

                var images = this.model.get('images');

                console.log('images', images)

                var image = images.find(function (item) {
                    console.log(e.target.id);
                    return item.id == e.target.id;
                });
                console.log('THIS IMG ID', image);

                new ImageView({
                    el: '#modal',
                    model: new ImageModel({
                        id: image.id,
                        image: image.image,
                        username: image.username,
                        title: image.title,
                        description: image.description,
                        date: image.created_at
                    })
                });

                e.preventDefault();

                $('.modal').css({
                    'display': 'block'
                });

                // $('.modal-content').attr('src', this.image)

                // $('.modal').on('click', function (e) {
                //     $('.modal').css({
                //         'display': 'none'
                //     })
                // })

                $('.close').on('click', (e) => {

                    $('.modal').css({
                        'display': 'none'
                    });

                });

            },


            'click .more': function (e) {


                var images = this.model.get('images');

                var sliced = images.slice(0, next);

                console.log(images, next, sliced);

                var html = Handlebars.templates.cards({
                    images: sliced
                });

                this.$el.html(html);

                console.log(html);

                next += 5;
            },

        }
    });



    var ImageModel = Backbone.Model.extend({

        url: function () {
            return `/home/${this.get('id')}`;
        },

        save: function (obj) {
            console.log("about to save", this, this.url());


            var model = this;

            $.ajax({
                url: this.url(),
                method: 'POST',
                data: obj,
                success: function (data) {
                    model.set(data)
                }
            });
        },

        initialize: function () {
            console.log(this.id);

            this.fetch();
        }


    });


    var ImageView = Backbone.View.extend({

        initialize: function () {
            var view = this;

            this.model.on('change', function () {
                view.render();
                console.log("image view occurred");
            });
        },

        render: function () {

            var data = this.model.toJSON();

            var html = Handlebars.templates.bigImage(data);

            this.$el.html(html);

            console.log(data);
        },

        events: {

            'click #post-comment': function (e) {

                const username = this.$el.find('input[name=username]').val();
                const comment = this.$el.find('input[name=comment]').val();
                const imgID = this.model.get('id');

                if (username && comment && imgID) {

                    this.model.save({
                        username: username,
                        comment: comment,
                        img_id: imgID
                    })
                }
            },

            'mouseover .big-img': function () {

                $('.img-info').css({
                    'display': 'block'
                });

            },

            'mouseleave .big-img': function () {

                $('.img-info').css({
                    'display': 'none'
                });

            }

            // 'click .modal': function () {
            //     console.log('click body')
            //
            //     $('.modal').css({
            //         'display': 'none'
            //     });
            //
            // }
        }

    });



    var UploadModel = Backbone.Model.extend({
        url: '/upload',
        save: function () {

            var formData = new FormData;

            formData.append('file', this.get('file'));
            formData.append('title', this.get('title'));
            formData.append('description', this.get('description'));
            formData.append('username', this.get('username'));



            var model = this;

            $.ajax({
                url: this.url,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function () {

                    router.navigate('', true);

                }
            });
        }
    });

    var UploadView = Backbone.View.extend({
        initialize: function () {
            this.render();

            this.model.on('fileUploaded',function(){
                router.navigate('', true);
            });
        },
        render: function () {
            this.$el.html(Handlebars.templates.upload())
        },
        events: {
            'click .closer' : function () {

                $('.upload-container').css({
                    'transform': 'translate(-100%)',
                    'transition': '1s',
                });

                $('.modal').css({
                    'display': 'none'
                });

                $('body').css({
                    'overflow': 'hidden'
                });
                location.hash = "";

            },
            'click #upload-button': function (e) {

                const username = this.$el.find('input[name=username]').val();
                const description = this.$el.find('input[name=description]').val();
                const title = this.$el.find('input[name="title"]').val();
                const file = this.$el.find('input[type="file"]').get(0).files[0];

                if (username && description && title && file) {

                    this.model.set({
                        username: this.$el.find('input[name=username]').val(),
                        description: this.$el.find('input[name=description]').val(),
                        title: this.$el.find('input[name="title"]').val(),
                        file: this.$el.find('input[type="file"]').get(0).files[0]
                    }).save()

                    $('.upload-container').css({
                        'transform': 'translate(-100%)',
                        'transition': '2s',
                    });

                    $('.modal').css({
                        'display': 'none'
                    });

                    $('body').css({
                        'overflow': 'hidden'
                    });

                } else {
                    alert('All fields must be filled!');
                }
            },

            'click #exit-button': function (e) {
                $('.upload-container').css({
                    'transform': 'translate(-100%)',
                    'transition': '2s',
                });

                $('body').css({
                    'overflow': 'hidden'
                });

                location.hash = "";

            }
         }
    });


    var Router = Backbone.Router.extend({
        routes: {
            '': 'home',
            'home': 'home',
            'home/:id': 'image',
            'images': 'images',
            'upload': 'upload'
        },

        home: function () {

            new CardsView({
                el: '#main',
                model: new CardsModel
            });
        },

        image: function (id) {
            new ImageView({
                el: '#modal',
                model: new ImageModel({
                    id: id
                })
            });
        },

        upload: function () {
            new UploadView({
                el: '#upload',
                model: new UploadModel
            }).render();
        }
    });



    var router = new Router;
    Backbone.history.start();

})();
