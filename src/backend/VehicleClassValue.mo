import OQL "mo:caffeineai-oql";

// OQL value conversion for the detected vehicle-class variant.
module {
  public func _toRow(self : { #car; #motorcycle; #bus; #truck }) : OQL.Value =
    #text(
      switch self {
        case (#car) { "car" };
        case (#motorcycle) { "motorcycle" };
        case (#bus) { "bus" };
        case (#truck) { "truck" };
      }
    );
};
