import OQL "mo:caffeineai-oql";

// OQL value conversion for the incident resolution-status variant.
module {
  public func _toRow(self : { #unresolved; #resolved }) : OQL.Value =
    #text(
      switch self {
        case (#unresolved) { "unresolved" };
        case (#resolved) { "resolved" };
      }
    );
};
