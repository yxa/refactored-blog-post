describe('Authentication Form',function(){
  "use strict";

  var authenticationForm, ajaxStub;

  beforeEach(function(done) {
    ajaxStub = sinon.stub($, "ajax");
    authenticationForm = Object.create(AuthenticationForm);
    authenticationForm.init({ ajax: ajaxStub });
    authenticationForm.init();
    done();
  });

  afterEach(function(done) {
    authenticationForm.teardown();
    authenticationForm = null;
    $.ajax.restore();
    done();
  });

  it("should submitForm with valid username and password", function(done) {

      function okResponse() {
        var d = $.Deferred();
        d.resolve( { username: "testuser", userid: "userid", success: true } );
        return d.promise();
      };

      ajaxStub.returns(okResponse());

      $("#username").val("testuser");
      $("#password").val("password");

      authenticationForm.submitForm(function(error) {
        expect(error).to.be.null;
        expect($("#authentication_success")).to.be.visible;
        expect($.ajax.calledOnce).to.be.true;
        done();
      });
  });



  it("should submitForm with invalid username and password", function(done) {
      $("#username").val("testuser");
      $("#password").val("invalidpassword");

      function okResponse() {
        var d = $.Deferred();
        d.resolve( { username: "testuser", userid: "userid", success: false } );
        return d.promise();
      };

      ajaxStub.returns(okResponse());

      authenticationForm.submitForm(function(error) {
        expect(error).to.be.a('null');
        expect($("#authentication_failure")).to.be.visible;
        done();
      });
  });

  it("should submitForm with missing username and password", function(done) {
    $("#username").val("");
    $("#password").val("");

    authenticationForm.submitForm(function(error) {
      expect(error).to.be.eql("username_password_required");
      expect($("#username_password_required")).to.be.visible;
      done();
    });
  });

  it("should submitForm with XHR error", function(done) {
    $("#username").val("testuser");
    $("#password").val("password");

    function errorResponse() {
      var d = $.Deferred();
      d.reject({},{},"could not complete");
      return d.promise();
    };

    ajaxStub.returns(errorResponse());

    authenticationForm.submitForm(function(error) {
      expect(error).to.be.eql("could not complete");
      expect($("#authentication_error")).to.be.visible;
      done();
    });
  });

  it("should check authentication with valid user", function(done) {

    function okResponse() {
      var d = $.Deferred();
      d.resolve( { username: "testuser", userid: "userid", success: true } );
      return d.promise();
    };

    ajaxStub.returns(okResponse());

    authenticationForm.checkAuthentication("testuser", "password", function(error, user) {

      expect($.ajax.calledWithMatch({ type: "POST" })).to.be.true;
      expect($.ajax.calledWithMatch({ url: "/authenticate_user" })).to.be.true;
      expect($.ajax.calledWithMatch({ data: {username: "testuser", password: "password"} })).to.be.true;

      expect(user.username).to.be.eql("testuser");
      expect(user.userid).to.be.eql("userid");

      done();
    });
  });

  it("should check authentication with missing XHR error", function(done) {

    function errorResponse() {
      var d = $.Deferred();
      d.reject({},{},"could not complete");
      return d.promise();
    };

    ajaxStub.returns(errorResponse());

    authenticationForm.checkAuthentication("testuser", "password", function(error) {
      expect(error).to.be.eql("could not complete");
      done();
    });
  });

});
