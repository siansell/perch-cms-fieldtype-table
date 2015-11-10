describe('Object helper', function () {
  //
  // Handsontable.helper.isObjectEquals
  //
  describe('isObjectEquals', function() {
    it("should returns true on equal objects", function () {
      expect(Handsontable.helper.isObjectEquals({}, {})).toBe(true);
      expect(Handsontable.helper.isObjectEquals({test: 1}, {test: 1})).toBe(true);
      expect(Handsontable.helper.isObjectEquals({test: {test2: [{}]}}, {test: {test2: [{}]}})).toBe(true);

      expect(Handsontable.helper.isObjectEquals([], [])).toBe(true);
      expect(Handsontable.helper.isObjectEquals([33], [33])).toBe(true);
      expect(Handsontable.helper.isObjectEquals([{test: 1}], [{test: 1}])).toBe(true);
    });

    it("should returns false for not equal objects", function () {
      expect(Handsontable.helper.isObjectEquals({}, [])).toBe(false);

      expect(Handsontable.helper.isObjectEquals({test: 2}, {test: 1})).toBe(false);
      expect(Handsontable.helper.isObjectEquals({test: {test3: [{}]}}, {test: {test2: [{}]}})).toBe(false);

      expect(Handsontable.helper.isObjectEquals([12], [33])).toBe(false);
      expect(Handsontable.helper.isObjectEquals([{test: 3}], [{test: 1}])).toBe(false);
    });
  });

  //
  // Handsontable.helper.duckSchema
  //
  describe('duckSchema', function() {
    it("should returns valid schema object", function () {
      expect(Handsontable.helper.duckSchema({})).toEqual({});
      expect(Handsontable.helper.duckSchema({test: 1})).toEqual({test: null});
      expect(Handsontable.helper.duckSchema({test: 'foo'})).toEqual({test: null});
      expect(Handsontable.helper.duckSchema({test: undefined})).toEqual({test: null});
      expect(Handsontable.helper.duckSchema({test: null})).toEqual({test: null});
      expect(Handsontable.helper.duckSchema({test: []})).toEqual({test: []});
      expect(Handsontable.helper.duckSchema({test: [1, 2, 3]})).toEqual({test: []});
    });

    it("should returns valid schema object (deeply)", function () {
      expect(Handsontable.helper.duckSchema({test: {a: {b: 11}}})).toEqual({test: {a: {b: null}}});
      expect(Handsontable.helper.duckSchema({test: {a: {b: []}}})).toEqual({test: {a: {b: []}}});
      expect(Handsontable.helper.duckSchema({test: {a: {b: [{q: 1, w: 2}]}}})).toEqual({test: {a: {b: [{q: null, w: null}]}}});
    });
  });

  //
  // Handsontable.helper.mixin
  //
  describe('mixin', function() {
    it("should mix base object from one object", function () {
      var Base = function() {};
      var MixinFoo = {
        local: 'value',
        myFunction: function() {
          return this.local;
        },
        mySetterFunction: function(value) {
          this.local = value;
        }
      };

      Handsontable.helper.mixin(Base, MixinFoo);

      var instance = new Base();

      expect(instance.myFunction()).toBe('value');
      expect(instance.local).toBe('value');

      instance.local = 123;

      expect(instance.myFunction()).toBe(123);
      expect(instance.local).toBe(123);

      var initialObject = {a: 1};
      instance.mySetterFunction(initialObject);

      expect(instance.myFunction()).toBe(initialObject);
      expect(instance.local).toBe(initialObject);
    });

    it("should mix base object from multiple objects", function () {
      var Base = function() {};
      var MixinFoo = {
        local: 'value',
        myFunction: function() {
          return this.local;
        },
        mySetterFunction: function(value) {
          this.local = value;
        }
      };
      var MixinBar = {
        test: {zzz: 2}
      };
      var MixinBaz = {
        getTest: function() {
          return this.test;
        }
      };

      Handsontable.helper.mixin(Base, MixinFoo, MixinBar, MixinBaz);

      var instance = new Base();

      expect(instance.myFunction()).toBe('value');
      expect(instance.local).toBe('value');
      expect(instance.test).not.toBe(MixinBar.test);
      expect(instance.test).toEqual(MixinBar.test);
      expect(instance.test.zzz).toBe(2);
      expect(instance.getTest()).not.toBe(MixinBar.test);
      expect(instance.getTest()).toEqual(MixinBar.test);
    });

    it("mixed object shouldn\'t interfere with properties from another mixed objects", function () {
      var Base = function() {};
      var Base1 = function() {};
      var MixinFoo = {
        local: {},
        myFunction: function() {
          return this.local.test = 1;
        }
      };

      Handsontable.helper.mixin(Base, MixinFoo);
      Handsontable.helper.mixin(Base1, MixinFoo);

      var instance = new Base();
      var instance1 = new Base1();

      instance.myFunction();

      expect(instance.local.test).toEqual(1);
      expect(instance1.local.test).not.toBeDefined();
    });
  });
});
