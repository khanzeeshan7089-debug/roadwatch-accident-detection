import OQL "mo:caffeineai-oql";

// OQL value conversion for the camera connection-status variant.
module {
  public func _toRow(self : { #online; #offline }) : OQL.Value =
    #text(
      switch self {
        case (#online) { "online" };
        case (#offline) { "offline" };
      }
    );
};
