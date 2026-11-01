import OQL "mo:caffeineai-oql";

// OQL value conversion for the camera monitoring-state variant.
module {
  public func _toRow(self : { #monitoring; #stopped }) : OQL.Value =
    #text(
      switch self {
        case (#monitoring) { "monitoring" };
        case (#stopped) { "stopped" };
      }
    );
};
