import OQL "mo:caffeineai-oql";

// OQL value conversion for the camera video-source variant.
module {
  public func _toRow(self : { #uploadedFile; #rtspStream; #sample }) : OQL.Value =
    #text(
      switch self {
        case (#uploadedFile) { "uploadedFile" };
        case (#rtspStream) { "rtspStream" };
        case (#sample) { "sample" };
      }
    );
};
