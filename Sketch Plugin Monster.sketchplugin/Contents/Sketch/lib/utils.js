var utils = {
  path: {
    join: function () {
      var paths = NSMutableArray.alloc().init();
      for (var i = 0; i < arguments.length; i++) {
        paths.addObject(arguments[i]);
      }
      return NSString.pathWithComponents(paths);
    }
  },
  fs: {
    readdir: function (path) {
      return NSFileManager.defaultManager().contentsOfDirectoryAtPath_error(path, nil);
    },
    readFile: function (path) {
      return NSString.stringWithContentsOfFile_encoding_error(path, 4, nil);
    },
    writeFile: function (path, data) {
      if (!/\n$/.test(data)) {
        data += '\n';
      }
      return NSString.stringWithString(data).writeToFile_atomically_encoding_error(path, true, 4, nil);
    },
    readSubpaths: function (path) {
      return NSFileManager.defaultManager().subpathsAtPath(path);
    },
    fileExists: function (path) {
      return NSFileManager.defaultManager().fileExistsAtPath(path);
    }
  },
  JSON: {
    parse: function (data) {
      // remove useless commas to avoid parse error
      var replaceReg = new RegExp(',(\\n\\s*(\\}|\\]))', 'g');

      return JSON.parse(String(data).replace(replaceReg, '$1'));
    },
    stringify: function (data) {
      return JSON.stringify(data, null, 2);
    }
  },
  array: {
    forEach: function (source, cb) {
      var len = source.length || (source.count && source.count()) || 0;

      for (var i = 0; i < len; i++) {
        if (cb.call(null, source[i], i) == true) break;
      }
    },
    filter: function (source, cb) {
      var result = [];

      utils.array.forEach(source, function (item, index) {
        if (cb.call(null, item, index)) {
          result.push(item);
        }
      });

      return result;
    }
  },
  system: {
    getLanguage: function () {
      var lang = NSUserDefaults.standardUserDefaults().objectForKey('AppleLanguages').objectAtIndex(0);
      var macOSVersion = String(NSDictionary.dictionaryWithContentsOfFile('/System/Library/CoreServices/SystemVersion.plist')
                                     .objectForKey('ProductVersion'));

      return macOSVersion >= '10.12' ? lang.split('-').slice(0, -1).join('-') : lang;
    },
    getI18n: function (context) {
      var path = utils.path.join(context.scriptPath.stringByDeletingLastPathComponent(),
                                                    '/i18n',
                                                    utils.system.getLanguage() + '.json');
      var i18n;

      if (utils.fs.fileExists(path)) {
        i18n = utils.fs.readFile(path);
      } else {
        i18n = utils.fs.readFile(path.replace(/[\w\-]*\.json$/, '/en.json'));
      }

      return utils.JSON.parse(i18n);
    },
    againstVersion: function (againstVersion, baseVersion) {
      return parseInt(againstVersion.replace(/\./g, ''), 10) > parseInt(baseVersion.replace(/\./g, ''), 10);
    }
  },
};
